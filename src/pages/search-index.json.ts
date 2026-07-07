import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

interface SearchEntry {
  type: 'system-code' | 'authority' | 'spelling-system' | 'enum' | 'page' | 'news';
  id: string;
  href: string;
  title: string;
  subtitle?: string;
  description?: string;
  keywords?: string[];
}

function refId(v: unknown): string | null {
  if (v == null) return null;
  if (typeof v === 'string') return v;
  if (typeof v === 'object') {
    const obj = v as Record<string, unknown>;
    const direct = obj.id ?? obj.uuid ?? obj.$ref ?? obj.slug;
    if (typeof direct === 'string') return direct;
  }
  return null;
}

function buildSystemCodeKeywords(data: Record<string, unknown>): string[] {
  const kws = new Set<string>();
  const code = String(data.code ?? '');
  if (code) {
    kws.add(code);
    for (const seg of code.split(':')) kws.add(seg);
  }
  const name = String(data.name ?? '');
  if (name) kws.add(name);
  const authId = refId(data.authority);
  if (authId) kws.add(authId);
  for (const f of ['sourceSpelling', 'targetSpelling', 'sourceScriptCode', 'targetScriptCode']) {
    const v = data[f];
    const id = refId(v) ?? (typeof v === 'string' ? v : null);
    if (id) kws.add(id);
  }
  const identifying = String(data.identifyingSegment ?? '');
  if (identifying) kws.add(identifying);
  return [...kws];
}

function parseSpellingLangScript(data: Record<string, unknown>): { language?: string; script?: string } {
  return {
    language: typeof data.languageCode === 'string' ? data.languageCode : undefined,
    script: typeof data.scriptCode === 'string' ? data.scriptCode : undefined,
  };
}

export const GET: APIRoute = async () => {
  const entries: SearchEntry[] = [];

  // ── Static pages (learn, specs, about, news index, register landing) ──
  const staticPages: SearchEntry[] = [
    { type: 'page', id: 'page:home', href: '/', title: 'ISO 24229 Registry', description: 'The international standard for writing system conversion systems.', keywords: ['home', 'iso 24229', 'registry', 'romanization', 'transliteration'] },
    { type: 'page', id: 'page:learn', href: '/learn', title: 'Learn', description: 'Understand ISO 24229 — codes, definitions, examples, FAQ, and specification.' },
    { type: 'page', id: 'page:learn-introduction', href: '/learn/introduction', title: 'Introduction to ISO 24229', description: 'Purpose of the standard, how it composes with ISO 639 and ISO 15924, and the problems it solves.' },
    { type: 'page', id: 'page:learn-code-structure', href: '/learn/code-structure', title: 'Anatomy of a code', description: 'The four-segment colon-form structure of an ISO 24229 code.' },
    { type: 'page', id: 'page:learn-authorities', href: '/learn/authorities', title: 'Conversion system authorities', description: 'Who can register codes, the requirements, the registration process, and identifier rules.' },
    { type: 'page', id: 'page:learn-examples', href: '/learn/examples', title: 'Worked examples', description: 'Real-world ISO 24229 codes broken down segment by segment.' },
    { type: 'page', id: 'page:learn-use-cases', href: '/learn/use-cases', title: 'Use cases', description: 'Library catalogues, gazetteers, passports, linguistic research, software localisation, and more.' },
    { type: 'page', id: 'page:learn-glossary', href: '/learn/glossary', title: 'Glossary', description: 'Definitions of script, spelling system, transliteration, transcription, romanization, and related terms.' },
    { type: 'page', id: 'page:learn-comparison', href: '/learn/comparison', title: 'Comparison with related standards', description: 'How ISO 24229 relates to ISO 639, ISO 15924, and other identification systems.' },
    { type: 'page', id: 'page:learn-faq', href: '/learn/faq', title: 'FAQ', description: 'Frequently asked questions about ISO 24229 and the register.' },
    { type: 'page', id: 'page:specs', href: '/specs', title: 'Specification', description: 'The formal data model, governance, and Annex A Terms of Reference.' },
    { type: 'page', id: 'page:specs-data-model', href: '/specs/data-model', title: 'Data model', description: 'The conceptual entities, attributes, and relationships defined in §6 of ISO 24229.' },
    { type: 'page', id: 'page:specs-governance', href: '/specs/governance', title: 'Governance and lifecycle', description: 'How the register is managed: authority, decision-making, lifecycle of codes.' },
    { type: 'page', id: 'page:specs-annex-a', href: '/specs/ag-tor', title: 'Annex A — Terms of Reference', description: 'The ToR for the Registration Authority and Advisory Group.' },
    { type: 'page', id: 'page:specs-iso-19135', href: '/specs/iso-19135', title: 'ISO 19135 compliance', description: 'How the register conforms to ISO 19135 procedures for registration of geographic items.' },
    { type: 'page', id: 'page:about', href: '/about', title: 'About', description: 'The international standard for writing system conversion systems, the URN pattern, the logomark, and the colour palette.' },
    { type: 'page', id: 'page:about-apply', href: '/about/apply', title: 'Apply — propose a system', description: 'How to propose a new conversion system, authority, or change. Submission form, RA review, AG deliberation, decision.' },
    { type: 'page', id: 'page:about-apply-submit', href: '/about/apply/submit', title: 'Submit a proposal (interactive form)', description: 'Validated interactive form that generates ready-to-paste Markdown with a SHA-256 integrity checksum for the Registration Authority to verify.' },
    { type: 'page', id: 'page:news', href: '/news', title: 'News', description: 'Announcements from the Registration Authority and Advisory Group.' },
    { type: 'page', id: 'page:register', href: '/register', title: 'Browse the register', description: 'The register contains every writing system conversion system, authority, and spelling system that has been assigned an ISO 24229 code.' },
    { type: 'page', id: 'page:register-authority', href: '/register/authority', title: 'Authorities', description: 'Directory of conversion system authorities — the bodies that maintain registered systems.' },
  ];
  entries.push(...staticPages);

  // ── News posts ──
  const news = await getCollection('news');
  for (const p of news) {
    const d = p.data as Record<string, unknown>;
    entries.push({
      type: 'news',
      id: `news:${p.id}`,
      href: `/news/${p.id}/`,
      title: String(d.title ?? p.id),
      subtitle: d.author ? String(d.author) : undefined,
      description: String(d.summary ?? ''),
      keywords: Array.isArray(d.tags) ? d.tags.map(String) : undefined,
    });
  }

  // ── Authority ──
  const authorities = await getCollection('authority');
  for (const a of authorities) {
    const d = a.data as Record<string, unknown>;
    entries.push({
      type: 'authority',
      id: `authority:${a.id}`,
      href: `/register/authority/${a.id}`,
      title: String(d.name ?? a.id),
      subtitle: `@${String(d.authorityIdentifier ?? a.id)}`,
      description: typeof d.abstract === 'string' ? d.abstract : undefined,
    });
  }

  // ── Spelling-system ──
  const spellings = await getCollection('spelling-system');
  for (const s of spellings) {
    const d = s.data as Record<string, unknown>;
    const { language, script } = parseSpellingLangScript(d);
    entries.push({
      type: 'spelling-system',
      id: `spelling-system:${s.id}`,
      href: `/register/spelling-system/i/${s.id}`,
      title: s.id,
      subtitle: [language, script].filter(Boolean).join(' / '),
      keywords: [s.id, language, script, d.countryCode].filter((x): x is string => typeof x === 'string' && x.length > 0),
    });
  }

  // ── System-code ──
  const systems = await getCollection('system-code');
  for (const s of systems) {
    const d = s.data as Record<string, unknown>;
    const code = String(d.code ?? s.id);
    entries.push({
      type: 'system-code',
      id: `system-code:${s.id}`,
      href: `/register/system-code/i/${s.id}`,
      title: String(d.name ?? code),
      subtitle: code,
      description: typeof d.abstract === 'string' ? d.abstract : undefined,
      keywords: buildSystemCodeKeywords(d),
    });
  }

  // ── Enum tables (small but useful for "what does proposed mean?") ──
  for (const slug of ['code-status', 'system-status', 'system-relation-type']) {
    try {
      const coll = await getCollection(slug as any);
      for (const e of coll as unknown as Array<{ id: string; data: Record<string, unknown> }>) {
        const d = e.data;
        const label = String(d.codeStatus ?? d.systemStatus ?? d.systemRelationType ?? e.id);
        entries.push({
          type: 'enum',
          id: `${slug}:${e.id}`,
          href: `/register/${slug}/i/${e.id}`,
          title: label,
          subtitle: slug,
          description: typeof d.remarks === 'string' ? d.remarks : undefined,
        });
      }
    } catch { /* collection may be empty */ }
  }

  return new Response(JSON.stringify(entries), {
    headers: { 'Content-Type': 'application/json' },
  });
};
