/**
 * Corporate profiler for French companies.
 *
 * Data source:
 * - https://recherche-entreprises.api.gouv.fr
 */

export interface CorporateProfile {
  officialName: string;
  registrationNumber: string;
  fullAddress: string;
  principalExecutiveName: string | null;
  legalCategoryOrNaf: string | null;
  source: "api-gouv-recherche-entreprises";
}

export interface CorporateProfilerOptions {
  timeoutMs?: number;
  signal?: AbortSignal;
}

export class CorporateProfilerError extends Error {
  public readonly code:
    | "BAD_INPUT"
    | "UNSUPPORTED_COUNTRY"
    | "HTTP_ERROR"
    | "INVALID_RESPONSE"
    | "TARGET_NOT_FOUND"
    | "NETWORK_ERROR";
  public readonly debug?: Record<string, unknown>;

  constructor(
    code: CorporateProfilerError["code"],
    message: string,
    debug?: Record<string, unknown>
  ) {
    super(message);
    this.name = "CorporateProfilerError";
    this.code = code;
    this.debug = debug;
  }
}

interface ApiDirigeant {
  nom?: string | null;
  prenoms?: string | null;
  denomination?: string | null;
  qualite?: string | null;
}

interface ApiSiege {
  siret?: string | null;
  adresse?: string | null;
}

interface ApiCompany {
  nom_complet?: string | null;
  nom_raison_sociale?: string | null;
  siren?: string | null;
  activite_principale?: string | null;
  nature_juridique?: string | null;
  siege?: ApiSiege | null;
  dirigeants?: ApiDirigeant[] | null;
}

interface ApiSearchResponse {
  results?: ApiCompany[];
}

const API_BASE_URL = "https://recherche-entreprises.api.gouv.fr/search";
const DEFAULT_TIMEOUT_MS = 12_000;
const EXECUTIVE_PRIORITY_REGEX = [
  /président|president/i,
  /gérant|gerant/i,
  /directeur général|directeur general/i,
  /ceo|chief executive/i,
];

/**
 * Fetches and normalizes corporate information from the French public API.
 *
 * @param companyName Company search string (e.g. "Airbus")
 * @param countryCode ISO country code, currently only "FR" is supported
 * @param options Timeout and abort options
 */
export async function profileCompany(
  companyName: string,
  countryCode: string,
  options: CorporateProfilerOptions = {}
): Promise<CorporateProfile> {
  const normalizedCountry = countryCode.trim().toUpperCase();
  const normalizedQuery = companyName.trim();

  if (!normalizedQuery) {
    throw new CorporateProfilerError(
      "BAD_INPUT",
      "Invalid input: companyName cannot be empty.",
      { companyName }
    );
  }

  if (normalizedCountry !== "FR") {
    throw new CorporateProfilerError(
      "UNSUPPORTED_COUNTRY",
      'Unsupported country code. This profiler currently supports only "FR".',
      { countryCode, supported: ["FR"] }
    );
  }

  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  if (options.signal) {
    options.signal.addEventListener("abort", () => controller.abort(), {
      once: true,
    });
  }

  const url = new URL(API_BASE_URL);
  url.searchParams.set("q", normalizedQuery);
  url.searchParams.set("page", "1");
  url.searchParams.set("per_page", "5");
  url.searchParams.set("minimal", "true");
  url.searchParams.set("include", "siege,dirigeants");

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      let responseBody = "";
      try {
        responseBody = await response.text();
      } catch {
        responseBody = "<unable to read body>";
      }

      const bodySnippet = responseBody.slice(0, 500);
      const status = response.status;

      const statusHint =
        status === 404
          ? "Endpoint not found (404). Verify API URL."
          : status === 429
            ? "Rate limit reached (429). Retry with backoff."
            : `Unexpected HTTP status ${status}.`;

      throw new CorporateProfilerError(
        "HTTP_ERROR",
        `Corporate profiling request failed: ${statusHint}`,
        {
          url: url.toString(),
          status,
          statusText: response.statusText,
          responseBodySnippet: bodySnippet,
        }
      );
    }

    const payload = (await response.json()) as ApiSearchResponse;
    const results = payload?.results;

    if (!Array.isArray(results)) {
      throw new CorporateProfilerError(
        "INVALID_RESPONSE",
        "API response format is invalid: missing 'results' array.",
        { url: url.toString(), payloadType: typeof payload }
      );
    }

    if (results.length === 0) {
      throw new CorporateProfilerError(
        "TARGET_NOT_FOUND",
        `No company found for query "${normalizedQuery}" in country "${normalizedCountry}".`,
        { query: normalizedQuery, countryCode: normalizedCountry }
      );
    }

    const selected = pickBestMatch(results, normalizedQuery);

    const officialName =
      selected.nom_complet?.trim() || selected.nom_raison_sociale?.trim();
    const registrationNumber =
      selected.siege?.siret?.trim() || selected.siren?.trim();
    const fullAddress = selected.siege?.adresse?.trim();
    const principalExecutiveName = findPrincipalExecutive(selected.dirigeants);
    const legalCategoryOrNaf =
      selected.nature_juridique?.trim() ||
      selected.activite_principale?.trim() ||
      null;

    if (!officialName || !registrationNumber || !fullAddress) {
      throw new CorporateProfilerError(
        "INVALID_RESPONSE",
        "API response does not contain enough fields to build profile.",
        {
          hasOfficialName: Boolean(officialName),
          hasRegistrationNumber: Boolean(registrationNumber),
          hasFullAddress: Boolean(fullAddress),
          url: url.toString(),
        }
      );
    }

    return {
      officialName,
      registrationNumber,
      fullAddress,
      principalExecutiveName,
      legalCategoryOrNaf,
      source: "api-gouv-recherche-entreprises",
    };
  } catch (error) {
    if (error instanceof CorporateProfilerError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : String(error);
    const isAbortError =
      error instanceof DOMException && error.name === "AbortError";

    throw new CorporateProfilerError(
      "NETWORK_ERROR",
      isAbortError
        ? `Request aborted or timed out after ${timeoutMs}ms.`
        : "Network failure while contacting corporate data API.",
      { url: url.toString(), originalError: message }
    );
  } finally {
    clearTimeout(timeout);
  }
}

function pickBestMatch(companies: ApiCompany[], query: string): ApiCompany {
  const normalizedQuery = normalize(query);
  const scored = companies.map((company, index) => {
    const name = company.nom_complet || company.nom_raison_sociale || "";
    const normalizedName = normalize(name);
    const score =
      normalizedName === normalizedQuery
        ? 3
        : normalizedName.startsWith(normalizedQuery)
          ? 2
          : normalizedName.includes(normalizedQuery)
            ? 1
            : 0;

    return { company, score, index };
  });

  scored.sort((a, b) => b.score - a.score || a.index - b.index);
  return scored[0].company;
}

function findPrincipalExecutive(
  dirigeants: ApiDirigeant[] | null | undefined
): string | null {
  if (!dirigeants?.length) {
    return null;
  }

  const sorted = [...dirigeants].sort((a, b) => {
    const aScore = scoreExecutiveRole(a.qualite);
    const bScore = scoreExecutiveRole(b.qualite);
    return bScore - aScore;
  });

  const best = sorted[0];
  const personName = [best.prenoms?.trim(), best.nom?.trim()]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (personName) {
    return personName;
  }

  const legalEntity = best.denomination?.trim();
  return legalEntity || null;
}

function scoreExecutiveRole(role: string | null | undefined): number {
  if (!role) {
    return 0;
  }
  for (let i = 0; i < EXECUTIVE_PRIORITY_REGEX.length; i += 1) {
    if (EXECUTIVE_PRIORITY_REGEX[i].test(role)) {
      return EXECUTIVE_PRIORITY_REGEX.length - i;
    }
  }
  return 0;
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}
