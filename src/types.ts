export enum Sector {
    PHARMA = 'Pharmacologie & Biotech',
    BTP = 'Bâtiment & Travaux Publics',
    TECH = 'Technologie & Cyber',
    DEFENSE = 'Défense & Aérospatial',
    FINANCE = 'Finance & Marchés',
    ENERGY = 'Énergie & Ressources'
}

export enum Range {
    LOCAL = 'Local (20km)',
    NATIONAL = 'National',
    GLOBAL = 'Mondial / International'
}

// --- Identity & Legal ---

export interface Etablissement {
    siret: string;
    adresse: string;
    ville: string;
    actif: boolean;
}

export interface LegalProfile {
    officialName: string;
    registrationNumber: string;
    fullAddress: string;
    principalExecutiveName: string | null;
    legalCategoryOrNaf: string | null;
    etablissements?: Etablissement[];
    parentCompany?: string | null;
}

// --- Media & News ---

export interface NewsItem {
    title: string;
    link: string;
    pubDate: string;
    source: string;
}

// --- SOCMINT (Social Media Intelligence) ---

export interface SocialProfile {
    network: 'LinkedIn' | 'Twitter' | 'Facebook' | 'Instagram';
    url: string;
    confidence: 'High' | 'Medium';
}

// --- CYBINT (Cyber Intelligence) ---

export interface DnsRecord {
    type: string;
    name: string;
    data: string;
    ttl?: number;
}

export interface WhoisInfo {
    domainName: string;
    registrar: string;
    creationDate: string;
    expirationDate: string;
    nameServers: string[];
    status: string[];
    registrantOrg?: string;
    registrantCountry?: string;
}

export interface CyberProfile {
    domain: string;
    dns: DnsRecord[];
    whois: WhoisInfo | null;
}

// --- FININT (Financial Intelligence) ---

export interface FinancialMetric {
    label: string;
    value: string;
    trend: 'up' | 'down' | 'stable';
}

export interface FinancialBriefing {
    summary: string;
    risks: string[];
    opportunities: string[];
    keyMetrics: FinancialMetric[];
    sectorOutlook: string;
}

// --- GEOINT (Geospatial Intelligence) ---

export interface GeoLocation {
    lat: number;
    lon: number;
    displayName: string;
    type: string;
}

// --- Core Target Data ---

export interface TargetData {
    id: string;
    name: string;
    type: string;
    targetType: 'company' | 'person';
    sector: Sector | string;
    scope: Range | string;
    domain?: string;
    legalProfile: LegalProfile | null;
    newsFeed: NewsItem[];
    socialProfiles?: SocialProfile[];
    cyberProfile?: CyberProfile | null;
    financialBriefing?: FinancialBriefing | null;
    geoLocation?: GeoLocation | null;
    timestamp?: string;
}

// --- Dashboard Navigation ---

export type DashboardTab =
    | 'Vue Globale'
    | 'Identité'
    | 'Sentinelle Médias'
    | 'SOCMINT'
    | 'CYBINT'
    | 'FININT'
    | 'GEOINT'
    | 'Profiler IA';
