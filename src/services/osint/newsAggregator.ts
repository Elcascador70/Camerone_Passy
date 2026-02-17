/**
 * News aggregation for Google News RSS.
 */

export type NewsErrorCode =
  | "NEWS_BAD_INPUT"
  | "NEWS_TIMEOUT"
  | "NEWS_FETCH_ERROR"
  | "NEWS_PARSE_ERROR";

export class NewsFetchError extends Error {
  public readonly code: NewsErrorCode;
  public readonly debug?: Record<string, unknown>;

  constructor(
    code: NewsErrorCode,
    message: string,
    debug?: Record<string, unknown>
  ) {
    super(message);
    this.name = "NewsFetchError";
    this.code = code;
    this.debug = debug;
  }
}

export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
}

interface NewsAggregatorOptions {
  timeoutMs?: number;
  maxItems?: number;
  signal?: AbortSignal;
}

const GOOGLE_NEWS_RSS_URL = "https://news.google.com/rss/search";
const DEFAULT_TIMEOUT_MS = 12_000;
const DEFAULT_MAX_ITEMS = 10;

/**
 * Main safe function: never throws and returns an empty array on errors.
 */
export async function fetchTargetNews(companyName: string): Promise<NewsItem[]> {
  try {
    return await fetchTargetNewsStrict(companyName);
  } catch {
    return [];
  }
}

/**
 * Strict function: throws typed NewsFetchError on failure.
 */
export async function fetchTargetNewsStrict(
  companyName: string,
  options: NewsAggregatorOptions = {}
): Promise<NewsItem[]> {
  const query = companyName.trim();
  if (!query) {
    throw new NewsFetchError(
      "NEWS_BAD_INPUT",
      "Invalid input: companyName cannot be empty.",
      { companyName }
    );
  }

  const maxItems = clampMaxItems(options.maxItems ?? DEFAULT_MAX_ITEMS);
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  if (options.signal) {
    options.signal.addEventListener("abort", () => controller.abort(), {
      once: true,
    });
  }

  const rssUrl = new URL(GOOGLE_NEWS_RSS_URL);
  rssUrl.searchParams.set("q", `"${query}"`);
  rssUrl.searchParams.set("hl", "fr");
  rssUrl.searchParams.set("gl", "FR");
  rssUrl.searchParams.set("ceid", "FR:fr");

  try {
    const response = await fetch(rssUrl.toString(), {
      method: "GET",
      headers: {
        Accept: "application/rss+xml, application/xml, text/xml",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      const snippet = await readBodySnippet(response);
      throw new NewsFetchError(
        "NEWS_FETCH_ERROR",
        `Unable to fetch Google News RSS (HTTP ${response.status}).`,
        {
          url: rssUrl.toString(),
          status: response.status,
          statusText: response.statusText,
          responseBodySnippet: snippet,
        }
      );
    }

    const xml = await response.text();
    const parsed = parseGoogleNewsRss(xml);
    if (!parsed.length) {
      return [];
    }

    const cleaned = parsed
      .map((item) => ({
        title: cleanTitle(item.title, item.source),
        link: cleanText(item.link),
        pubDate: normalizeDate(item.pubDate),
        source: cleanText(item.source) || "Source inconnue",
      }))
      .filter((item) => Boolean(item.title) && Boolean(item.link))
      .sort((a, b) => safeDateMs(b.pubDate) - safeDateMs(a.pubDate))
      .slice(0, maxItems);

    if (!cleaned.length) {
      return [];
    }

    const resolvedLinks = await Promise.all(
      cleaned.map((item) => resolvePublisherUrl(item.link, timeoutMs))
    );

    return cleaned.map((item, index) => ({
      ...item,
      link: resolvedLinks[index],
    }));
  } catch (error) {
    if (error instanceof NewsFetchError) {
      throw error;
    }

    const isAbort = error instanceof DOMException && error.name === "AbortError";
    throw new NewsFetchError(
      isAbort ? "NEWS_TIMEOUT" : "NEWS_FETCH_ERROR",
      isAbort
        ? `News fetch timed out after ${timeoutMs}ms.`
        : "Unexpected error while fetching Google News RSS.",
      { url: rssUrl.toString(), originalError: toMessage(error) }
    );
  } finally {
    clearTimeout(timeout);
  }
}

function clampMaxItems(value: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    return DEFAULT_MAX_ITEMS;
  }
  return Math.min(Math.floor(value), 50);
}

function parseGoogleNewsRss(xml: string): Array<{
  title: string;
  link: string;
  pubDate: string;
  source: string;
}> {
  if (!xml || typeof xml !== "string") {
    throw new NewsFetchError(
      "NEWS_PARSE_ERROR",
      "Invalid RSS payload: expected XML string."
    );
  }

  const items = extractBlocks(xml, "item");
  return items.map((itemXml) => {
    const title = extractTagText(itemXml, "title");
    const link = extractTagText(itemXml, "link");
    const pubDate = extractTagText(itemXml, "pubDate");
    const source = extractTagText(itemXml, "source");

    return {
      title: decodeXmlEntities(stripCdata(title)),
      link: decodeXmlEntities(stripCdata(link)),
      pubDate: decodeXmlEntities(stripCdata(pubDate)),
      source: decodeXmlEntities(stripCdata(source)),
    };
  });
}

function extractBlocks(xml: string, tagName: string): string[] {
  const regex = new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "gi");
  const blocks: string[] = [];

  let match: RegExpExecArray | null;
  match = regex.exec(xml);
  while (match) {
    blocks.push(match[0]);
    match = regex.exec(xml);
  }
  return blocks;
}

function extractTagText(xmlFragment: string, tagName: string): string {
  const regex = new RegExp(
    `<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`,
    "i"
  );
  const match = regex.exec(xmlFragment);
  return match?.[1]?.trim() ?? "";
}

function stripCdata(value: string): string {
  return value
    .replace(/^<!\[CDATA\[/i, "")
    .replace(/\]\]>$/i, "")
    .trim();
}

function cleanTitle(title: string, source: string): string {
  let cleaned = cleanText(title);
  const sourceText = cleanText(source);

  if (sourceText) {
    const escapedSource = escapeRegex(sourceText);
    const trailingSourcePattern = new RegExp(`\\s+-\\s+${escapedSource}$`, "i");
    cleaned = cleaned.replace(trailingSourcePattern, "").trim();
  }

  return cleaned;
}

function cleanText(value: string): string {
  return value.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function normalizeDate(input: string): string {
  const trimmed = input.trim();
  const parsed = Date.parse(trimmed);
  if (Number.isNaN(parsed)) {
    return trimmed;
  }
  return new Date(parsed).toISOString();
}

function safeDateMs(input: string): number {
  const parsed = Date.parse(input);
  return Number.isNaN(parsed) ? 0 : parsed;
}

async function resolvePublisherUrl(url: string, timeoutMs: number): Promise<string> {
  if (!isGoogleNewsRedirect(url)) {
    return url;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Math.min(timeoutMs, 5_000));

  try {
    const headResponse = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
    });
    if (headResponse.url) {
      return headResponse.url;
    }
  } catch {
    // fallback to GET
  } finally {
    clearTimeout(timeout);
  }

  const fallbackController = new AbortController();
  const fallbackTimeout = setTimeout(
    () => fallbackController.abort(),
    Math.min(timeoutMs, 6_000)
  );

  try {
    const getResponse = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: fallbackController.signal,
    });

    if (getResponse.body) {
      await getResponse.body.cancel();
    }

    return getResponse.url || url;
  } catch {
    return url;
  } finally {
    clearTimeout(fallbackTimeout);
  }
}

function isGoogleNewsRedirect(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname === "news.google.com" &&
      (parsed.pathname.includes("/rss/articles/") ||
        parsed.pathname.includes("/articles/"))
    );
  } catch {
    return false;
  }
}

function decodeXmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#x2F;/g, "/");
}

async function readBodySnippet(response: Response): Promise<string> {
  try {
    const text = await response.text();
    return text.slice(0, 500);
  } catch {
    return "<unreadable response body>";
  }
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
