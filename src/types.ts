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

export interface LegalProfile {
    officialName: string;
    registrationNumber: string;
    fullAddress: string;
    principalExecutiveName: string | null;
    legalCategoryOrNaf: string | null;
}

export interface NewsItem {
    title: string;
    link: string;
    pubDate: string;
    source: string;
}

export interface TargetData {
    id: string;
    name: string;
    type: string;
    sector: Sector | string;
    scope: Range | string;
    legalProfile: LegalProfile | null;
    newsFeed: NewsItem[];
    timestamp?: string;
}
