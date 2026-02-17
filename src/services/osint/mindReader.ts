/**
 * MIND-READER — Module d'analyse psychologique par LLM.
 *
 * Utilise l'API Groq (compatible OpenAI) via fetch standard.
 * Aucun SDK externe requis.
 */

// ────────────────────────────── Interfaces ──────────────────────────────

export interface OceanScores {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

export interface PsychProfile {
  ocean: OceanScores;
  darkTriad: string[];
  influenceLevers: string[];
  vulnerabilities: string[];
}

export type MindReaderErrorCode =
  | "EMPTY_INPUT"
  | "API_ERROR"
  | "INVALID_JSON"
  | "VALIDATION_ERROR";

export class MindReaderError extends Error {
  public readonly code: MindReaderErrorCode;
  public readonly debug?: Record<string, unknown>;

  constructor(
    code: MindReaderErrorCode,
    message: string,
    debug?: Record<string, unknown>
  ) {
    super(message);
    this.name = "MindReaderError";
    this.code = code;
    this.debug = debug;
  }
}

// ────────────────────────────── Options ──────────────────────────────

interface MindReaderOptions {
  /** Timeout en ms (défaut : 30 000). */
  timeoutMs?: number;
  /** Modèle Groq à utiliser (défaut : llama-3.3-70b-versatile). */
  model?: string;
}

// ────────────────────────────── Constantes ──────────────────────────────

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";
const DEFAULT_TIMEOUT_MS = 30_000;

const SYSTEM_PROMPT = `Tu es un profileur psychologique du renseignement. Analyse ces textes écrits par la cible.
1. Évalue-la sur l'échelle OCEAN (Score 1-10).
2. Détecte les traits de la Triade Noire.
3. Identifie ses leviers d'influence et vulnérabilités.
Tu dois OBLIGATOIREMENT répondre UNIQUEMENT avec un objet JSON valide correspondant à l'interface suivante, sans aucun texte avant ou après :
{
  "ocean": { "openness": number, "conscientiousness": number, "extraversion": number, "agreeableness": number, "neuroticism": number },
  "darkTriad": ["string, ..."],
  "influenceLevers": ["string, ..."],
  "vulnerabilities": ["string, ..."]
}`;

// ────────────────────────────── Validation ──────────────────────────────

function isOceanScore(v: unknown): v is number {
  return typeof v === "number" && v >= 1 && v <= 10;
}

function validatePsychProfile(raw: unknown): PsychProfile {
  if (typeof raw !== "object" || raw === null) {
    throw new MindReaderError("VALIDATION_ERROR", "La réponse n'est pas un objet.");
  }

  const obj = raw as Record<string, unknown>;

  // Valider ocean
  if (typeof obj.ocean !== "object" || obj.ocean === null) {
    throw new MindReaderError("VALIDATION_ERROR", "Champ 'ocean' manquant ou invalide.");
  }
  const ocean = obj.ocean as Record<string, unknown>;
  const requiredTraits = ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"] as const;
  for (const trait of requiredTraits) {
    if (!isOceanScore(ocean[trait])) {
      throw new MindReaderError("VALIDATION_ERROR", `Trait OCEAN '${trait}' invalide (attendu: nombre 1-10).`);
    }
  }

  // Valider les tableaux
  const arrayFields = ["darkTriad", "influenceLevers", "vulnerabilities"] as const;
  for (const field of arrayFields) {
    if (!Array.isArray(obj[field])) {
      throw new MindReaderError("VALIDATION_ERROR", `Champ '${field}' manquant ou pas un tableau.`);
    }
  }

  return {
    ocean: ocean as unknown as OceanScores,
    darkTriad: (obj.darkTriad as unknown[]).map(String),
    influenceLevers: (obj.influenceLevers as unknown[]).map(String),
    vulnerabilities: (obj.vulnerabilities as unknown[]).map(String),
  };
}

// ────────────────────────────── Fonction principale ──────────────────────────────

/**
 * Génère un profil psychologique à partir de textes écrits par la cible.
 *
 * @param texts  — Tableau de textes (posts, emails, messages) écrits par la cible.
 * @param apiKey — Clé API Groq.
 * @param opts   — Options (timeout, modèle).
 * @returns Le profil psychologique, ou `null` si l'analyse échoue.
 */
export async function generatePsychProfile(
  texts: string[],
  apiKey: string,
  opts: MindReaderOptions = {}
): Promise<PsychProfile | null> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, model = DEFAULT_MODEL } = opts;

  // ── Garde : entrées vides ──
  const cleaned = texts.map((t) => t.trim()).filter(Boolean);
  if (cleaned.length === 0) {
    console.warn("[MIND-READER] Aucun texte fourni, analyse annulée.");
    return null;
  }

  const userContent = cleaned
    .map((t, i) => `--- Texte ${i + 1} ---\n${t}`)
    .join("\n\n");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[MIND-READER] API Groq ${res.status}: ${body}`);
      return null;
    }

    const json = await res.json();
    const raw = json?.choices?.[0]?.message?.content;

    if (typeof raw !== "string" || raw.trim().length === 0) {
      console.error("[MIND-READER] Réponse LLM vide ou inattendue.", json);
      return null;
    }

    // Extraire le JSON (le LLM peut encapsuler dans ```json ... ```)
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("[MIND-READER] Impossible d'extraire un objet JSON de la réponse.", raw);
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return validatePsychProfile(parsed);
  } catch (err) {
    if (err instanceof MindReaderError) {
      console.error(`[MIND-READER] ${err.code}: ${err.message}`);
    } else if (err instanceof SyntaxError) {
      console.error("[MIND-READER] JSON invalide dans la réponse LLM.", err);
    } else {
      console.error("[MIND-READER] Erreur inattendue.", err);
    }
    return null;
  } finally {
    clearTimeout(timer);
  }
}
