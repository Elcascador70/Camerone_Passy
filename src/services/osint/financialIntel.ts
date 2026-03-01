import type { FinancialBriefing, NewsItem, LegalProfile } from '../../types';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Generate a financial intelligence briefing using LLM analysis
 * of news headlines and legal profile data.
 */
export async function generateFinancialBriefing(
    targetName: string,
    news: NewsItem[],
    legalProfile: LegalProfile | null,
    sector: string,
    apiKey: string,
    signal?: AbortSignal
): Promise<FinancialBriefing | null> {
    if (!apiKey) return null;

    const newsContext = news.length > 0
        ? news.slice(0, 15).map(n => `- [${n.pubDate?.split('T')[0] ?? '?'}] ${n.title}`).join('\n')
        : 'Aucune actualité récente disponible.';

    const legalContext = legalProfile
        ? [
            `Raison sociale: ${legalProfile.officialName}`,
            `SIRET: ${legalProfile.registrationNumber}`,
            `Adresse: ${legalProfile.fullAddress}`,
            `Dirigeant: ${legalProfile.principalExecutiveName ?? 'Non renseigné'}`,
            `Catégorie/NAF: ${legalProfile.legalCategoryOrNaf ?? 'Non renseigné'}`,
            `Nb établissements: ${legalProfile.etablissements?.length ?? 0}`,
            legalProfile.parentCompany ? `Maison mère: ${legalProfile.parentCompany}` : null,
        ].filter(Boolean).join('\n')
        : 'Pas de profil légal disponible.';

    const systemPrompt = `Tu es un analyste en intelligence financière (FININT) pour un service de renseignement économique.
Analyse les données ci-dessous sur la cible "${targetName}" (secteur: ${sector}) et produis un briefing financier structuré.

PROFIL LÉGAL:
${legalContext}

ACTUALITÉS RÉCENTES:
${newsContext}

Réponds UNIQUEMENT en JSON valide avec ce format exact:
{
  "summary": "Synthèse financière en 2-3 phrases",
  "risks": ["risque 1", "risque 2", "risque 3"],
  "opportunities": ["opportunité 1", "opportunité 2"],
  "keyMetrics": [
    {"label": "Nom métrique", "value": "Valeur estimée", "trend": "up|down|stable"}
  ],
  "sectorOutlook": "Analyse sectorielle en 1-2 phrases"
}

Règles:
- 3 à 5 risques identifiés
- 2 à 4 opportunités
- 3 à 5 métriques clés (CA estimé, effectifs, croissance, etc.)
- Trend: "up" si positif, "down" si négatif, "stable" si neutre
- Tout en français
- Base ton analyse sur les signaux faibles des actualités`;

    try {
        const res = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Produis le briefing FININT pour: ${targetName}` },
                ],
                temperature: 0.3,
                max_tokens: 1500,
            }),
            signal: signal ?? AbortSignal.timeout(30000),
        });

        if (!res.ok) {
            console.error('[FININT] Groq API error:', res.status);
            return null;
        }

        const json = await res.json();
        const raw = json.choices?.[0]?.message?.content?.trim();
        if (!raw) return null;

        const jsonStr = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        const parsed = JSON.parse(jsonStr);

        if (!parsed.summary || !Array.isArray(parsed.risks)) return null;

        return {
            summary: parsed.summary,
            risks: parsed.risks,
            opportunities: parsed.opportunities ?? [],
            keyMetrics: (parsed.keyMetrics ?? []).map((m: { label: string; value: string; trend?: string }) => ({
                label: m.label,
                value: m.value,
                trend: (['up', 'down', 'stable'].includes(m.trend ?? '') ? m.trend : 'stable') as 'up' | 'down' | 'stable',
            })),
            sectorOutlook: parsed.sectorOutlook ?? '',
        };
    } catch (err) {
        console.error('[FININT] Analysis failed:', err);
        return null;
    }
}
