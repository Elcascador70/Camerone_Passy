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

export interface TargetData {
  name: string;
  sector: Sector;
  range: Range;
  timestamp: string;
}

export interface WidgetProps {
  target: TargetData;
}
