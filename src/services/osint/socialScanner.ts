/**
 * Social profile scanner using free web dorking over DuckDuckGo Lite.
 */

export type SocialScanErrorCode =
  | "SOCIAL_BAD_INPUT"
  | "SOCIAL_TIMEOUT"
  | "SOCIAL_FETCH_ERROR"
  | "SOCIAL_PARSE_ERROR";

export class SocialScanError extends Error {
  public readonly code: SocialScanErrorCode;
  public readonly debug?: Record<string, unknown>;

  constructor(
    code: SocialScanErrorCode,
    message: string,
    debug?: Record<string, unknown>
  ) {
    super(message);
    this.name = "SocialScanError";
    this.code = code;
    this.debug = debug;
  }
}

export type SocialNetwork = "LinkedIn" | "Twitter" | "Facebook" | "Instagram";
export type SocialConfidence = "High" | "Medium";

export interface SocialProfileResult {
  network: SocialNetwork;
  url: string;
  confidence: SocialConfidence;
}

interface SocialScannerOptions {
  timeoutMs?: number;
  signal?: AbortSignal;
}

interface ParsedResultLink {
  title: string;
  url: string;
}

interface CandidateProfile {
  network: SocialNetwork;
  url: string;
  confidence: SocialConfidence;
  score: number;
}

const DUCKDUCKGO_LITE_URL = "https://lite.duckduckgo.com/lite/";
const DEFAULT_TIMEOUT_MS = 12_000;

const NETWORK_ORDER: SocialNetwork[] = [
  "LinkedIn",
  "Twitter",
  "Facebook",
  "Instagram",
];

const RESERVED_TWITTER_PATHS = new Set([
  "home",
  "search",
  "explore",
  "i",
  "intent",
  "share",
  "hashtag",
  "messages",
  "settings",
  "privacy",
  "tos",
]);

const RESERVED_FACEBOOK_PATHS = new Set([
  "pages",
  "groups",
  "events",
  "watch",
  "marketplace",
  "gaming",
  "profile.php",
  "plugins",
  "share.php",
  "sharer",
]);

const RESERVED_INSTAGRAM_PATHS = new Set([
  "p",
  "reel",
  "reels",
  "explore",
  "stories",
  "accounts",
  "about",
  "developer",
  "privacy",
  "legal",
  "direct",
]);

/**
 * Safe entry point: never throws and returns [] on failure.
 */
export async function scanSocialProfiles(
  targetName: string
): Promise<SocialProfileResult[]> {
  try {
    return await scanSocialProfilesStrict(targetName);
  } catch {
    return [];
  }
}

/**
 * Strict variant with typed errors for backend debugging.
 */
export async function scanSocialProfilesStrict(
  targetName: string,
  options: SocialScannerOptions = {}
): Promise<SocialProfileResult[]> {
  const cleanedTarget = targetName.trim();
  if (!cleanedTarget) {
    throw new SocialScanError(
      "SOCIAL_BAD_INPUT",
      "Invalid input: targetName cannot be empty.",
      { targetName }
    );
  }

  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  if (options.signal) {
    options.signal.addEventListener("abort", () => controller.abort(), {
      once: true,
    });
  }

  const query = buildDorkQuery(cleanedTarget);
  const searchUrl = new URL(DUCKDUCKGO_LITE_URL);
  searchUrl.searchParams.set("q", query);
  searchUrl.searchParams.set("kl", "fr-fr");

  try {
    const response = await fetch(searchUrl.toString(), {
      method: "GET",
      headers: {
        Accept: "text/html,application/xhtml+xml",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      const bodySnippet = await readBodySnippet(response);
      throw new SocialScanError(
        "SOCIAL_FETCH_ERROR",
        `DuckDuckGo Lite request failed (HTTP ${response.status}).`,
        {
          url: searchUrl.toString(),
          status: response.status,
          statusText: response.statusText,
          responseBodySnippet: bodySnippet,
        }
      );
    }

    const html = await response.text();
    const links = parseDuckDuckGoLiteLinks(html);
    if (!links.length) {
      return [];
    }

    const tokens = buildTargetTokens(cleanedTarget);
    const candidates = extractCandidates(links, tokens);
    if (!candidates.length) {
      return [];
    }

    return pickBestByNetwork(candidates);
  } catch (error) {
    if (error instanceof SocialScanError) {
      throw error;
    }

    const isAbort = error instanceof DOMException && error.name === "AbortError";
    throw new SocialScanError(
      isAbort ? "SOCIAL_TIMEOUT" : "SOCIAL_FETCH_ERROR",
      isAbort
        ? `Social scan timed out after ${timeoutMs}ms.`
        : "Unexpected error during social profile scan.",
      { url: searchUrl.toString(), originalError: toMessage(error) }
    );
  } finally {
    clearTimeout(timeout);
  }
}

function buildDorkQuery(targetName: string): string {
  return `"${targetName}" (site:linkedin.com/company OR site:twitter.com OR site:x.com OR site:facebook.com OR site:instagram.com)`;
}

function parseDuckDuckGoLiteLinks(html: string): ParsedResultLink[] {
  if (!html || typeof html !== "string") {
    throw new SocialScanError(
      "SOCIAL_PARSE_ERROR",
      "Invalid HTML payload from DuckDuckGo Lite."
    );
  }

  const results: ParsedResultLink[] = [];
  const anchorRegex =
    /<a[^>]*class=['"][^'"]*result-link[^'"]*['"][^>]*href=['"]([^'"]+)['"][^>]*>([\s\S]*?)<\/a>/gi;

  let match = anchorRegex.exec(html);
  while (match) {
    const href = decodeHtml(match[1] ?? "");
    const title = cleanText(decodeHtml(match[2] ?? ""));
    const resolved = resolveDuckDuckGoHref(href);

    if (resolved && title) {
      results.push({ title, url: resolved });
    }

    match = anchorRegex.exec(html);
  }

  return results;
}

function resolveDuckDuckGoHref(rawHref: string): string | null {
  if (!rawHref) {
    return null;
  }

  let href = rawHref.trim();
  if (href.startsWith("//")) {
    href = `https:${href}`;
  }

  try {
    const url = new URL(href);

    const isDuckRedirect =
      (url.hostname === "duckduckgo.com" || url.hostname === "www.duckduckgo.com") &&
      url.pathname.startsWith("/l/");

    if (isDuckRedirect) {
      const uddg = url.searchParams.get("uddg");
      if (uddg) {
        return decodeURIComponent(uddg);
      }
    }

    return url.toString();
  } catch {
    return null;
  }
}

function extractCandidates(
  links: ParsedResultLink[],
  targetTokens: string[]
): CandidateProfile[] {
  const candidates: CandidateProfile[] = [];

  for (const link of links) {
    const network = detectNetwork(link.url);
    if (!network) {
      continue;
    }

    const canonicalUrl = canonicalizeProfileUrl(network, link.url);
    if (!canonicalUrl) {
      continue;
    }

    const scored = scoreCandidate(network, canonicalUrl, link.title, targetTokens);
    candidates.push(scored);
  }

  return deduplicateCandidates(candidates);
}

function detectNetwork(url: string): SocialNetwork | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./i, "").toLowerCase();

    if (host.endsWith("linkedin.com")) {
      return "LinkedIn";
    }
    if (host.endsWith("twitter.com") || host.endsWith("x.com")) {
      return "Twitter";
    }
    if (host.endsWith("facebook.com")) {
      return "Facebook";
    }
    if (host.endsWith("instagram.com")) {
      return "Instagram";
    }

    return null;
  } catch {
    return null;
  }
}

function canonicalizeProfileUrl(network: SocialNetwork, url: string): string | null {
  try {
    const parsed = new URL(url);
    const pathParts = parsed.pathname.split("/").filter(Boolean);

    if (network === "LinkedIn") {
      if (pathParts.length < 2 || pathParts[0].toLowerCase() !== "company") {
        return null;
      }
      const slug = pathParts[1].toLowerCase();
      if (!slug || slug === "search") {
        return null;
      }
      return `https://www.linkedin.com/company/${slug}`;
    }

    if (network === "Twitter") {
      const handle = (pathParts[0] ?? "").toLowerCase();
      if (!handle || RESERVED_TWITTER_PATHS.has(handle) || handle.startsWith("@")) {
        return null;
      }
      if (!/^[a-z0-9_]{1,15}$/i.test(handle)) {
        return null;
      }
      return `https://x.com/${handle}`;
    }

    if (network === "Facebook") {
      const first = (pathParts[0] ?? "").toLowerCase();
      if (!first || RESERVED_FACEBOOK_PATHS.has(first)) {
        return null;
      }
      if (first === "profile.php") {
        return null;
      }
      return `https://www.facebook.com/${first}`;
    }

    const igHandle = (pathParts[0] ?? "").toLowerCase();
    if (!igHandle || RESERVED_INSTAGRAM_PATHS.has(igHandle)) {
      return null;
    }
    if (!/^[a-z0-9._]{1,30}$/i.test(igHandle)) {
      return null;
    }
    return `https://www.instagram.com/${igHandle}/`;
  } catch {
    return null;
  }
}

function scoreCandidate(
  network: SocialNetwork,
  canonicalUrl: string,
  title: string,
  targetTokens: string[]
): CandidateProfile {
  const urlText = normalizeText(canonicalUrl);
  const titleText = normalizeText(title);
  let score = 0;

  for (const token of targetTokens) {
    if (urlText.includes(token)) {
      score += 2;
    }
    if (titleText.includes(token)) {
      score += 1;
    }
  }

  const confidence: SocialConfidence = score >= 3 ? "High" : "Medium";
  return { network, url: canonicalUrl, confidence, score };
}

function deduplicateCandidates(candidates: CandidateProfile[]): CandidateProfile[] {
  const map = new Map<string, CandidateProfile>();

  for (const candidate of candidates) {
    const key = `${candidate.network}|${candidate.url}`;
    const previous = map.get(key);
    if (!previous || candidate.score > previous.score) {
      map.set(key, candidate);
    }
  }

  return [...map.values()];
}

function pickBestByNetwork(candidates: CandidateProfile[]): SocialProfileResult[] {
  const byNetwork = new Map<SocialNetwork, CandidateProfile[]>();

  for (const candidate of candidates) {
    const existing = byNetwork.get(candidate.network) ?? [];
    existing.push(candidate);
    byNetwork.set(candidate.network, existing);
  }

  const results: SocialProfileResult[] = [];
  for (const network of NETWORK_ORDER) {
    const list = byNetwork.get(network);
    if (!list || !list.length) {
      continue;
    }

    list.sort((a, b) => {
      const confidenceRank = rankConfidence(b.confidence) - rankConfidence(a.confidence);
      if (confidenceRank !== 0) {
        return confidenceRank;
      }
      return b.score - a.score;
    });

    const best = list[0];
    results.push({
      network: best.network,
      url: best.url,
      confidence: best.confidence,
    });
  }

  return results;
}

function buildTargetTokens(targetName: string): string[] {
  const normalized = normalizeText(targetName);
  const rawTokens = normalized.split(/[^a-z0-9]+/).filter(Boolean);
  const filtered = rawTokens.filter((token) => token.length >= 3);

  if (filtered.length) {
    return filtered;
  }
  return rawTokens;
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function cleanText(value: string): string {
  return value.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function rankConfidence(value: SocialConfidence): number {
  return value === "High" ? 2 : 1;
}

async function readBodySnippet(response: Response): Promise<string> {
  try {
    const text = await response.text();
    return text.slice(0, 500);
  } catch {
    return "<unreadable response body>";
  }
}

function toMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
