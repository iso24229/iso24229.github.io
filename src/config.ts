/**
 * Site-wide configuration — single source of truth for nav, footer, etc.
 */

export const siteUrl = "https://www.iso24229.org";
export const siteTitle = "ISO 24229 Registry";
export const siteDescription =
  "The official register of written-language conversion systems, designated by ISO under ISO 24229.";

/** Repository links that the UI needs. */
export const repoUrls = {
  website: "https://github.com/iso24229/iso24229.github.io",
  register: "https://github.com/iso24229/iso24229-register",
  iso639Data: "https://github.com/iso24229/iso639-data",
  iso15924Data: "https://github.com/iso24229/iso15924-data",
} as const;

/** External reference links. */
export const externalLinks = {
  iso24229Standard: "https://www.iso.org/standard/78143.html",
  iso19135Standard: "https://www.iso.org/standard/53600.html",
  iso639Standard: "https://www.iso.org/iso-639-language-code",
  iso15924Standard: "https://www.unicode.org/iso15924/",
  ferin: "https://ferin.org",
  calconnect: "https://www.calconnect.org",
  ribose: "https://open.ribose.com",
} as const;

/** Top-level navigation. New sections = push an entry here. */
export interface NavItem {
  label: string;
  href: string;
  description: string;
  /** Audience this section primarily serves. */
  audience: "newcomer" | "user" | "authority" | "manager" | "anyone";
}

export const navigation: NavItem[] = [
  {
    label: "Learn",
    href: "/learn",
    description: "What ISO 24229 is and how codes work.",
    audience: "newcomer",
  },
  {
    label: "Content",
    href: "/register",
    description: "Browse authorities, systems, and spelling systems.",
    audience: "user",
  },
  {
    label: "News",
    href: "/news",
    description: "Announcements from the RA and Advisory Group.",
    audience: "anyone",
  },
  {
    label: "Apply",
    href: "/apply",
    description: "Submit a new system or apply to register a new authority.",
    audience: "authority",
  },
  {
    label: "Managers",
    href: "/managers",
    description: "ISO/TC 46/AG materials: composition, meetings, ToR.",
    audience: "manager",
  },
  {
    label: "Specification",
    href: "/specification",
    description: "Register specification and Terms of Reference (Annex A).",
    audience: "anyone",
  },
  {
    label: "FAQ",
    href: "/faq",
    description: "Answers to common questions.",
    audience: "anyone",
  },
];

/** Footer operating authorities — rendered side-by-side. */
export interface OperatingAuthority {
  name: string;
  role: string;
  href: string;
  logo: {
    light: string;
    dark: string;
  };
  /** When true, the light-mode logo is reused in dark mode via CSS invert. */
  invertInDark?: boolean;
}

export const operatingAuthorities: OperatingAuthority[] = [
  {
    name: "CalConnect",
    role: "Registration Authority (ISO 24229/RA)",
    href: externalLinks.calconnect,
    logo: {
      light: "/assets/logos/calconnect-light.svg",
      dark: "/assets/logos/calconnect-dark.svg",
    },
  },
  {
    name: "Ribose",
    role: "Operator",
    href: externalLinks.ribose,
    logo: {
      light: "/assets/logos/ribose.svg",
      dark: "/assets/logos/ribose.svg",
    },
    invertInDark: true,
  },
];
