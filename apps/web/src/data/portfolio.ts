// Portfolio of things Francisco has built. Technical validation for the personal site.
// Rules: claim only what is verifiable, "In progress" for anything unfinished,
// no Rafik metrics, no client or investor names, no em dashes.

export type PortfolioStatus = "Live" | "In progress" | "Open source" | "Private";

export interface PortfolioItem {
  name: string;
  tag: string;
  status: PortfolioStatus;
  what: string;
  mine: string;
  stack: string[];
  href: string | null;
  cta: string | null;
}

export const portfolio: PortfolioItem[] = [
  {
    name: "Rafik",
    tag: "Company, co-founder",
    status: "In progress",
    what: "The legal hub for the future. Agents take the repetitive work of a law firm so lawyers grow, connect and practice law. An attorney reviews and signs everything that goes out.",
    mine: "Go-to-market, content and the agents. I also designed and shipped rafik.tech, its security and pricing pages, and the social presence. My co-founder is a corporate attorney who reviews every workflow.",
    stack: ["AI agents", "Astro", "TypeScript", "MCP"],
    href: "https://rafik.tech",
    cta: "See Rafik",
  },
  {
    name: "Flow",
    tag: "Open source, MIT",
    status: "Open source",
    what: "Voice dictation and meeting notes with AI, 100% local. It runs on your own computer, with no subscription and with your audio staying on your machine by default.",
    mine: "Built it end to end because the dictation tools I tried sent my audio away and charged monthly for something my own GPU could do. I use it every day. Released under the MIT license.",
    stack: ["Python", "Whisper", "Local GPU"],
    href: "https://github.com/franciscoabad-founder/flow",
    cta: "View the repo",
  },
  {
    name: "Pancho OS",
    tag: "Personal system",
    status: "Private",
    what: "The system I use to run my days and my companies: calendar, tasks, CRM, finances, a brain with everything I know, and agents that act only with my approval.",
    mine: "Designed and built it for myself first. It sits behind a login, but it is the working base for everything else on this page.",
    stack: ["Astro", "Supabase", "TypeScript", "Agents"],
    href: null,
    cta: null,
  },
  {
    name: "Nerio",
    tag: "Product",
    status: "Live",
    what: "A chief of staff with artificial intelligence. An agent that sees my calendar, tasks and decisions, proposes actions and executes only when I approve.",
    mine: "Started as an internal tool to run my own companies without losing the thread between projects. I tested it on myself every day before turning it into a product.",
    stack: ["AI agents", "TypeScript", "Supabase"],
    href: "https://nerio.lat",
    cta: "Visit Nerio",
  },
  {
    name: "PanchoAtlas",
    tag: "Content engine",
    status: "Private",
    what: "A pipeline that listens for signals (meetings, voice notes, my own knowledge base), turns them into content and distributes it to several channels without me publishing by hand.",
    mine: "I had no time to write and record everything I was learning while building. Instead of forcing myself to post more, I designed a system that captures and produces content from what I actually do each week.",
    stack: ["n8n", "LLMs", "Automation"],
    href: null,
    cta: null,
  },
  {
    name: "Finance AI Kit",
    tag: "Free resource",
    status: "Live",
    what: "Prompts, an Excel workbook with formulas, checklists and reusable assistants to organize personal or business finances with AI.",
    mine: "Created from a workshop for more than 40 women entrepreneurs in Quito. The kit is the practice; the workshop was the theory.",
    stack: ["Excel", "Prompts", "Claude"],
    href: "/kit",
    cta: "Get the kit",
  },
];
