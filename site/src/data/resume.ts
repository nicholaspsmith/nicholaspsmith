export type Job = {
  title: string;
  company: string;
  place: string;
  dates: string;
  intro?: string;
  points: string[];
  /** Shown in the short list on the home page. */
  highlight?: boolean;
};

export const PDF_PATH = '/Nicholas_Smith_Resume_2026.pdf';

export const RESUME = {
  name: 'Nicholas Smith',
  title: 'Senior Software Engineer, UI/UX',
  place: 'Charleston, SC',
  summary:
    'Senior Software Engineer and Tech Lead with over a decade of production UI, specializing in user experience (UX) development. Led engineering at an award-winning UX design agency and the frontend team at MongoDB, re-platforming mongodb.com. Currently a Data Engineer at ATI and building AI-native products through Bright Logic Digital: semantic search, generative-AI visualizers, and Claude API features. Designs everything before building it; strongest on hard UI problems like design systems, data-heavy interfaces, and the engineering underneath them.',
  skills: [
    ['Frontend', 'React, TypeScript, Next.js, Vite, Tailwind CSS, Radix UI, Framer Motion, Vue.js, D3'],
    ['APIs & Backend', 'GraphQL, Apollo Client, REST APIs, Node.js, Express, FastAPI, NextAuth.js'],
    ['Design & UX', 'Interaction design, design systems, Figma, Accessibility (WCAG, ARIA)'],
    ['Platform & AI', 'Claude API, MCP, RAG, LanceDB, Ollama, AWS, Azure, Vercel, Docker, PostgreSQL'],
    ['Languages', 'JavaScript, TypeScript, Node.js (primary), Python (working proficiency)'],
    ['Testing', 'Vitest, Jest, React Testing Library, Playwright, Cypress'],
  ],
  jobs: [
    {
      title: 'Founder & Principal Engineer',
      company: 'Bright Logic Digital, LLC',
      place: 'Charleston, SC',
      dates: 'Jul 2025 – Present',
      highlight: true,
      points: [
        'Own design and engineering end to end, from wireframes and visual design to React/TypeScript implementation.',
        "Designed and launched powellsupholsteryllc.com for Powell's Upholstery, LLC: a 16,000+ fabric catalog with AI semantic search, a generative-AI visualizer that previews fabrics on a customer's own furniture, and online ordering.",
        'Designed and developed Loopi, an AI-powered learning platform that generates personalized skill trees and uses FSRS spaced repetition for long-term retention. Next.js, React, TypeScript, PostgreSQL, LanceDB, Claude API.',
      ],
    },
    {
      title: 'Data Engineer',
      company: 'ATI (Advanced Technology International)',
      place: 'Charleston, SC',
      dates: 'Feb 2026 – Present',
      highlight: true,
      points: [
        'Lead the data migration from a legacy contract management system to Azure, building ETL pipelines (Azure Data Factory, Databricks, Python) with LLM-based transformations to map, cleanse, and validate data.',
        'Own data storage and management for Controlled Unclassified Information (CUI) across Azure Storage and Databricks, enforcing access controls and data-handling requirements.',
        'Build and maintain full-stack features for the consortia management application used by over 30 government contracting organizations, translating dense contract workflows into intuitive, user-friendly experiences.',
      ],
    },
    {
      title: 'Senior Software Engineer (Tech Lead)',
      company: 'MongoDB',
      place: 'Remote',
      dates: 'Dec 2022 – Jul 2025',
      highlight: true,
      intro: 'Led a team of engineers across 3 continents to migrate mongodb.com from an in-house CMS to Contentstack.',
      points: [
        'Built and maintained a shared React component library published as an internal npm package, adopted by multiple MongoDB web projects, reducing duplicate UI code across teams.',
        'Led a Tailwind integration that cut CSS bundle sizes by roughly 40% and shortened design-to-production time.',
        'Built accessibility (semantic markup, keyboard navigation, ARIA) into the shared component library.',
        'Led migration of 250+ pages onto a localization pipeline (Smartling, Contentstack localization, Next.js i18n routing) that cut publishing delays and delivered translated content 4x faster in 11 languages.',
        'Enabled 5x faster page publishing (150 vs. 30 pages per batch) with a Next.js framework on Contentstack Automate.',
      ],
    },
    {
      title: 'Senior Software Engineer, UI',
      company: 'Cisco Systems',
      place: 'Remote',
      dates: 'Oct 2019 – Dec 2022',
      highlight: true,
      intro:
        'Developed interfaces for Cisco SecureX that transformed and aggregated unstructured data into actionable threat intelligence, reducing incident response time and increasing visibility into security posture.',
      points: [
        'Built a threat correlation dashboard aggregating data from dozens of sources (including: Duo, Meraki, Orbital, Secure Endpoint, Umbrella) to determine CVE exposure.',
        'Created modular threat visualization widgets (React, D3, Recharts) that allowed non-security analysts to interpret threat data and respond to incidents.',
        'Developed and demoed a Threat Context POC to leadership, which greenlit it as a standalone product.',
      ],
    },
    {
      title: 'Lead Technologist',
      company: 'Handsome',
      place: 'Austin, TX',
      dates: 'Jun 2018 – Jun 2019',
      highlight: true,
      intro: 'Award-winning UX design agency whose clients included Meta, Google, Nickelodeon, FedEx, and TaxAct.',
      points: [
        'First software engineer hired at the agency; built and led its engineering department under the CTO, working closely with industry-leading UX designers to turn research and designs into shipped web and mobile apps.',
        'Worked on site with client ScoreSense (consumer credit fintech) to design and build an improved onboarding flow that led to a marked increase in customer conversions.',
        'Led delivery for clients from startups to Fortune 50 with globally distributed teams (React, Vue.js, Webflow, AWS), providing technical direction through planning and design.',
      ],
    },
    {
      title: 'Software Engineer III',
      company: 'Sovos',
      place: 'Boulder, CO',
      dates: 'Mar 2016 – Feb 2017',
      points: [
        "Led ShipCompliant's migration from ASP.NET Web Forms to React, and trained the team on best practices.",
        'Turned design mockups into pixel-perfect, high-fidelity UI shipped in the ShipCompliant suite.',
      ],
    },
    {
      title: 'Founder & Principal Engineer',
      company: 'Dreamline Studios, LLC',
      place: 'Austin, TX',
      dates: 'Jan 2016 – Mar 2018',
      points: [
        'Designed and shipped a real-time inventory platform (Meteor, React, React Native, MongoDB, GraphQL) that cut inventory counts from 8 hours to under 3.',
      ],
    },
    { title: 'Web Developer', company: 'Fahrenheit Marketing', place: 'Austin, TX', dates: '2015', points: [] },
    { title: 'Junior Web Developer', company: 'White Lion', place: 'Austin, TX', dates: '2014', points: [] },
    { title: 'Designer & Web Developer', company: 'El Paso Spine Center', place: 'El Paso, TX', dates: '2011 – 2013', points: [] },
  ] satisfies Job[],
  projects: [
    {
      name: 'nicksmith.software',
      href: 'https://nicksmith.software',
      text: 'Personal portfolio site recreating the Mac OS X Tiger desktop in the browser (working window system, Finder, Terminal) and iOS 15 on mobile. React 18, TypeScript, Vite, Framer Motion, Zustand.',
    },
    {
      name: 'Menumon',
      text: 'Suite of over 10 native macOS menu bar apps built on StatusItemKit, a shared Swift framework, each with a character icon drawn in code that animates with live state (a chameleon for VPN status, an owl for Claude usage).',
    },
    {
      name: 'Centrifugue',
      href: 'https://github.com/nicholaspsmith/Centrifugue',
      text: "Browser extension for AI-powered audio stem separation using Meta's Demucs model, with real-time progress. JavaScript, Python.",
    },
  ],
  education: [
    'BSBA, Management Information Systems, University of Arizona (2013)',
    'Full Stack Developer Certification, Hack Reactor (2013)',
    'Languages: Spanish (Conversational), Mandarin (HSK 2)',
    'Interests: Guitar, Music Production, Language Learning (human and computer), AI, Home Automation',
  ],
};
