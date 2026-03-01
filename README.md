# Camerone Passy - OSINT Intelligence Suite

Dashboard OSINT (Open Source Intelligence) construit avec React + TypeScript + Vite + Tailwind CSS v4.

## Requirements

- Node.js (version 18 or higher)
- npm (version 9 or higher)

## Installation

1. Clone the repository
2. Run `npm ci` to install dependencies
3. Create a `.env` file in the root directory with the required API keys (Firebase, Groq)
4. Run `npm run dev` to start the development server

## Variables d'environnement

| Variable | Description |
|---|---|
| `VITE_FIREBASE_*` | Configuration Firebase (apiKey, authDomain, projectId, etc.) |
| `VITE_GROQ_API_KEY` | Clé API Groq pour le module FININT (Llama-3.3-70B) |

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Type-check and build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Tech Stack

- **React 19** + **TypeScript**
- **Vite 7** (build tool)
- **Tailwind CSS v4** (via `@tailwindcss/postcss`)
- **Firebase** (backend services)
- **Recharts** (data visualization)
- **Lucide React** (icons)

## Project Structure

```
src/
├── assets/            # Static assets (SVGs, images)
├── components/        # UI components
│   ├── widgets/       # Dashboard widget components
│   │   ├── AiReportWidget.tsx   # Profiler IA (analyse psychologique LLM)
│   │   ├── CyberWidget.tsx      # CYBINT — DNS + WHOIS/RDAP
│   │   ├── FinanceWidget.tsx    # FININT — Briefing financier IA
│   │   ├── GeoWidget.tsx        # GEOINT — Géolocalisation OSM
│   │   ├── MapWidget.tsx        # Carte établissements
│   │   ├── OverviewWidget.tsx   # Vue globale (tableau de bord)
│   │   ├── ReputationWidget.tsx # Score de réputation
│   │   ├── SocialWidget.tsx     # SOCMINT — Réseaux sociaux
│   │   └── TickerWidget.tsx     # Flux actualités
│   ├── Dashboard.tsx  # Main dashboard (routing par onglets)
│   ├── Header.tsx     # App header
│   ├── Sidebar.tsx    # Navigation sidebar (8 onglets)
│   └── Wizard.tsx     # Wizard de déploiement (Entité / Personne)
├── services/          # API & backend services
│   ├── osint/         # OSINT data modules
│   │   ├── corporateProfiler.ts  # Profil légal (API Sirene)
│   │   ├── cyberIntel.ts         # DNS-over-HTTPS + RDAP
│   │   ├── financialIntel.ts     # Briefing FININT via Groq LLM
│   │   ├── geoIntel.ts           # Géocodage Nominatim
│   │   ├── mindReader.ts         # Profilage psychologique LLM
│   │   ├── newsAggregator.ts     # Agrégation actualités
│   │   └── socialScanner.ts      # DuckDuckGo Dorking SOCMINT
│   ├── db.ts          # Database service
│   └── firebaseConfig.ts
├── types.ts           # TypeScript type definitions
├── App.tsx            # Root component
├── App.css            # App-level styles
├── index.css          # Global styles + Tailwind
└── main.tsx           # Entry point
```

## Modules OSINT

| Module | Source | Statut |
|---|---|---|
| **Identité & Légal** | API Sirene (INSEE) | :white_check_mark: Livré |
| **Sentinelle Médias** | Google News RSS (via proxy) | :white_check_mark: Livré |
| **SOCMINT** | DuckDuckGo Lite Dorking (LinkedIn, Twitter/X, Facebook, Instagram) | :white_check_mark: Livré |
| **CYBINT** | Google DNS-over-HTTPS + RDAP (via corsproxy) | :white_check_mark: Livré |
| **FININT** | Groq LLM (Llama-3.3-70B) — analyse signaux faibles | :white_check_mark: Livré |
| **GEOINT** | OpenStreetMap Nominatim | :white_check_mark: Livré |
| **Profiler IA** | Groq LLM — profilage psychologique | :white_check_mark: Livré |

## Backlog

### Livré (v2.1)

- [x] Intégration Tailwind v4 + réparation Recharts
- [x] Wizard de déploiement avec toggle Entité Légale / Personne Physique
- [x] Champ domaine web optionnel dans le Wizard
- [x] Sélecteur de secteur libre (input + suggestions)
- [x] Dashboard 8 onglets avec navigation Sidebar
- [x] Vue Globale (OverviewWidget) — statut temps réel de chaque domaine OSINT
- [x] Module SOCMINT — scan réseaux sociaux via DuckDuckGo Dorking
- [x] Module CYBINT — records DNS (A, AAAA, MX, NS, TXT, CNAME) + WHOIS/RDAP
- [x] Module FININT — briefing financier IA (risques, opportunités, métriques clés)
- [x] Module GEOINT — géolocalisation sur carte OpenStreetMap (dark mode)
- [x] Types TypeScript complets pour tous les modules OSINT

### En cours / Prochaines étapes

- [ ] Scraping OSINT profond — Comex complet (organigramme dirigeants)
- [ ] Enrichissement SOCMINT — extraction de contenu des profils sociaux
- [ ] Module HUMINT — réseau relationnel et cartographie des connexions
- [ ] Export PDF du rapport complet
- [ ] Historique des recherches (Firebase Firestore)
- [ ] Authentification utilisateur (Firebase Auth)
- [ ] Alertes temps réel (monitoring continu d'une cible)
- [ ] Code splitting / lazy loading des widgets pour optimiser le bundle
