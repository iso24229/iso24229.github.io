import codeNames from '../../data/code-names.json';

export interface ScriptCodeInfo {
  code: string;
  name: string;
  url: string;
  standard: 'ISO 15924';
}

export interface LanguageCodeInfo {
  code: string;
  name: string;
  part: string;
  url: string;
  standard: 'ISO 639';
}

const scriptsMap = (codeNames as any).scripts as Record<string, { name: string; url: string }>;
const languagesMap = (codeNames as any).languages as Record<string, { name: string; part: string; url: string }>;

export function lookupScript(code: string | null | undefined): ScriptCodeInfo | null {
  if (!code || typeof code !== 'string') return null;
  // ISO 15924 codes are case-sensitive title-case (e.g. "Hani"), but our
  // lookup keys come from the iso15924-data filenames which preserve the
  // original case. Try the input verbatim first, then a title-cased
  // fallback (lower-cased first letter + upper-cased rest).
  if (scriptsMap[code]) {
    return { code, name: scriptsMap[code].name, url: scriptsMap[code].url, standard: 'ISO 15924' };
  }
  const titleCased = code.charAt(0).toUpperCase() + code.slice(1).toLowerCase();
  if (scriptsMap[titleCased]) {
    return { code: titleCased, name: scriptsMap[titleCased].name, url: scriptsMap[titleCased].url, standard: 'ISO 15924' };
  }
  return null;
}

export function lookupLanguage(code: string | null | undefined): LanguageCodeInfo | null {
  if (!code || typeof code !== 'string') return null;
  // ISO 639 codes are case-insensitive — normalise to lowercase for lookup.
  const lc = code.toLowerCase();
  // Spelling-system languageCodes may include a macrolanguage extension
  // like "qaa-qtz" or "eng-us". We only look up the first segment.
  const primary = lc.split(/[-_]/)[0];
  const hit = languagesMap[primary] ?? languagesMap[lc];
  if (!hit) return null;
  return { code: primary, name: hit.name, part: hit.part, url: hit.url, standard: 'ISO 639' };
}
