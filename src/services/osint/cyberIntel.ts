import type { CyberProfile, DnsRecord, WhoisInfo } from '../../types';

const CORS_PROXY = 'https://corsproxy.io/?url=';
const DNS_API = 'https://dns.google/resolve';
const RDAP_API = 'https://rdap.org/domain/';

/**
 * Resolve DNS records for a domain using Google DNS-over-HTTPS.
 */
async function resolveDns(domain: string): Promise<DnsRecord[]> {
    const recordTypes = ['A', 'AAAA', 'MX', 'NS', 'TXT', 'CNAME'];
    const records: DnsRecord[] = [];

    const results = await Promise.allSettled(
        recordTypes.map(async (type) => {
            const url = `${DNS_API}?name=${encodeURIComponent(domain)}&type=${type}`;
            const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
            if (!res.ok) return [];
            const json = await res.json();
            if (!json.Answer) return [];
            return json.Answer.map((a: { type: number; name: string; data: string; TTL?: number }) => ({
                type,
                name: a.name?.replace(/\.$/, '') ?? domain,
                data: a.data?.replace(/\.$/, '') ?? '',
                ttl: a.TTL,
            }));
        })
    );

    for (const result of results) {
        if (result.status === 'fulfilled' && Array.isArray(result.value)) {
            records.push(...result.value);
        }
    }

    return records;
}

/**
 * Fetch WHOIS-like data via RDAP protocol.
 */
async function fetchRdap(domain: string): Promise<WhoisInfo | null> {
    try {
        const url = `${CORS_PROXY}${encodeURIComponent(RDAP_API + domain)}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
        if (!res.ok) return null;
        const data = await res.json();

        const nameServers: string[] = (data.nameservers ?? [])
            .map((ns: { ldhName?: string }) => ns.ldhName?.toLowerCase())
            .filter(Boolean);

        const status: string[] = data.status ?? [];

        let registrar = '';
        let registrantOrg = '';
        let registrantCountry = '';

        if (Array.isArray(data.entities)) {
            for (const entity of data.entities) {
                const roles: string[] = entity.roles ?? [];
                const vcard = entity.vcardArray?.[1];

                if (roles.includes('registrar')) {
                    if (vcard) {
                        const fnEntry = vcard.find((v: string[]) => v[0] === 'fn');
                        if (fnEntry) registrar = fnEntry[3] ?? '';
                    }
                    if (!registrar && entity.handle) registrar = entity.handle;
                }

                if (roles.includes('registrant')) {
                    if (vcard) {
                        const fnEntry = vcard.find((v: string[]) => v[0] === 'fn');
                        if (fnEntry) registrantOrg = fnEntry[3] ?? '';

                        const adrEntry = vcard.find((v: string[]) => v[0] === 'adr');
                        if (adrEntry) {
                            const adrValue = adrEntry[3];
                            if (Array.isArray(adrValue)) {
                                registrantCountry = adrValue[6] ?? '';
                            }
                        }
                    }
                }
            }
        }

        const events = data.events ?? [];
        let creationDate = '';
        let expirationDate = '';

        for (const ev of events) {
            if (ev.eventAction === 'registration') creationDate = ev.eventDate ?? '';
            if (ev.eventAction === 'expiration') expirationDate = ev.eventDate ?? '';
        }

        return {
            domainName: data.ldhName ?? domain,
            registrar,
            creationDate,
            expirationDate,
            nameServers,
            status,
            registrantOrg: registrantOrg || undefined,
            registrantCountry: registrantCountry || undefined,
        };
    } catch (err) {
        console.warn('[CYBINT] RDAP fetch failed:', err);
        return null;
    }
}

/**
 * Build a full cyber profile for a given domain.
 */
export async function profileDomain(domain: string): Promise<CyberProfile> {
    const cleaned = domain
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .split('/')[0]
        .trim()
        .toLowerCase();

    if (!cleaned || !cleaned.includes('.')) {
        return { domain: cleaned, dns: [], whois: null };
    }

    const [dns, whois] = await Promise.all([
        resolveDns(cleaned).catch(() => [] as DnsRecord[]),
        fetchRdap(cleaned),
    ]);

    return { domain: cleaned, dns, whois };
}

/**
 * Try to guess a domain from a company name.
 * Returns the best guess or null.
 */
export function guessDomain(companyName: string): string | null {
    const cleaned = companyName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .split(/\s+/)
        .filter(w => !['sa', 'sas', 'sarl', 'eurl', 'sasu', 'se', 'group', 'groupe', 'et', 'les', 'des', 'the'].includes(w))
        .join('')
        .slice(0, 30);

    if (!cleaned || cleaned.length < 2) return null;
    return `${cleaned}.fr`;
}
