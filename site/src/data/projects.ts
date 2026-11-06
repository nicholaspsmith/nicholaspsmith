import type { ImageMetadata } from 'astro';
import chs from '../assets/work/chs.png';
import disasterMaps from '../assets/work/disaster-maps.png';
import iron from '../assets/work/iron.png';
import petdoses from '../assets/work/petdoses.png';
import powells from '../assets/work/powells.png';
import zimu from '../assets/work/zimu.png';

export type Project = {
  slug: string;
  name: string;
  stop: string;
  oneLine: string;
  summary: string;
  problem: string;
  did: string;
  result: string;
  live?: { href: string; label: string };
  image: ImageMetadata;
  imageAlt: string;
  portrait?: boolean;
  credit?: string;
};

export const PROJECTS: Project[] = [
  {
    slug: 'powells-upholstery',
    name: "Powell's Upholstery",
    stop: 'early',
    oneLine: 'See a fabric on your own furniture before you buy it.',
    summary: "A website for a family upholstery shop on Johns Island, built around a catalog of more than 16,000 fabrics.",
    problem:
      "Choosing upholstery means picturing a fabric on a piece of furniture you already own. With more than 16,000 fabrics to choose from, that is hard to do from a small swatch.",
    did:
      "I designed and built the whole site. Customers can describe what they're after to find a fabric, preview it on a photo of their own furniture, and order online.",
    result:
      'The site is live and I am still building on it. A huge catalog becomes something a customer can search in their own words and try on their own furniture.',
    live: { href: 'https://www.powellsupholsteryllc.com/', label: "Visit Powell's Upholstery" },
    image: powells,
    imageAlt: "The Powell's Upholstery home page: a white custom sofa with the headline Custom upholstery, made the old way.",
  },
  {
    slug: 'chs-irrigation-lighting',
    name: 'CHS Irrigation & Lighting',
    stop: 'morning',
    oneLine: 'A website that looks as good as the work, by day and after dark.',
    summary: 'A website for an owner-operated irrigation and landscape lighting company in Charleston.',
    problem:
      'A one-owner company competes with bigger firms for the same customers, and most people judge it by its website before they ever call.',
    did:
      'I wrote and designed an eight-page site around what sets the company apart: the person who gives you the estimate is the person who does the work.',
    result:
      'The company has a clear, fast site that explains its services and makes a free estimate easy to ask for.',
    live: { href: 'https://chsirrigationandlighting.com/', label: 'Visit CHS Irrigation & Lighting' },
    image: chs,
    imageAlt: 'The CHS Irrigation & Lighting home page: a lit house at dusk with the headline Green lawns by day. Beautiful homes after dark.',
  },
  {
    slug: 'disaster-maps',
    name: 'DisasterMaps',
    stop: 'midday',
    oneLine: 'A live map of what is dangerous and where, for when it matters most.',
    summary: 'A public hazard map and a coordination tool for disaster response teams, piloted in Charleston County.',
    problem:
      'In a flood or storm, residents need to know which roads are safe, and response teams need to get supplies to shelters without sending anyone into danger.',
    did:
      "My role: I designed and built most of what people see, from the public map to the app response teams use for routes, supplies and shelters. I work with Troy Swayney and Chris Edmonds, who lead much of what runs behind it.",
    result:
      'The pilot covers Charleston County and Summerville. The public site is still in preparation, so the picture here comes from the app itself.',
    image: disasterMaps,
    imageAlt: 'The DisasterMaps map of the Charleston area in dark colours.',
  },
  {
    slug: 'from-tired-to-iron',
    name: 'From Tired to Iron',
    stop: 'afternoon',
    oneLine: 'One app for training and food, on your phone, your watch and the web.',
    summary: 'A training and nutrition app built for a first full-distance triathlon.',
    problem:
      'Training for an Ironman means juggling workouts, meals, groceries and recovery, and every app only handles one of them.',
    did:
      'I designed and built all of it as one product: iPhone, Apple Watch and web. It plans meals, writes the shopping list, scales recipes, and shows what is left to eat today.',
    result:
      'One product, with the same plan on every device, carried from an idea to a polished app.',
    image: iron,
    imageAlt: "The app's Today screen: calories left, protein, carbs, fat and sodium, then the day's planned meals.",
    portrait: true,
  },
  {
    slug: 'zimu',
    name: 'Zimu',
    stop: 'sunset',
    oneLine: 'Learn Mandarin from the shows you already watch.',
    summary: 'A browser extension that turns subtitles into language lessons.',
    problem:
      'Language apps feel like homework, and real shows move too fast. I wanted to learn Mandarin from what I actually watch.',
    did:
      'I designed and built an extension that shows characters, pronunciation and English together. Click a word for its meaning, or the whole line for an explanation, and save anything as a flashcard that remembers the exact moment in the show.',
    result:
      'Every saved word comes back as a flashcard, with the sentence and the exact moment it was said.',
    image: zimu,
    imageAlt: 'A subtitle over a video, with a word opened to show its definition and a breakdown of its characters.',
  },
  {
    slug: 'petdoses',
    name: 'PetDoses',
    stop: 'dusk',
    oneLine: "Never wonder whether the dog already had today's pill.",
    summary: 'A free calendar for keeping track of pet medication.',
    problem:
      'Vet instructions get complicated: twice a day for five days, then once a day for five more. Mix that up and you risk missing a dose or doubling it.',
    did:
      'I designed and built a simple month calendar with morning and evening checklists and a count of the pills remaining. It needs no account, and your data stays on your device.',
    result:
      'A small tool that does one job and stays out of the way, with nothing to sign up for.',
    live: { href: 'https://petdoses.com/', label: 'Try PetDoses' },
    image: petdoses,
    imageAlt: "The PetDoses start screen: Track your pet's medications.",
  },
];
