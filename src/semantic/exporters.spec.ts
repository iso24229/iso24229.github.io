import { describe, it, expect } from 'vitest';
import { JsonLdExporter } from './JsonLdExporter';
import { TurtleExporter } from './TurtleExporter';
import { RdfXmlExporter } from './RdfXmlExporter';
import { Authority } from '../domain/items/Authority';
import { SystemCode } from '../domain/items/SystemCode';
import type { RegisterItem } from '../domain/items/RegisterItem';

const ts = new Date('2026-07-05T00:00:00Z');

const sampleAuthority: RegisterItem = new Authority(
  'acadsin', '', ts, ts, 'acadsin', 'Academia Sinica',
  { street: '128 Sec 2 Academia Rd', city: 'Taipei', country: 'TW', postalCode: '11529' },
  { email: 'open@ribose.com', url: 'https://www.sinica.edu.tw/' },
  [
    { name: 'Person One', role: 'Liaison', email: 'p1@example.org' },
    { name: 'Person Two', role: 'Deputy', email: 'p2@example.org' },
  ],
);

const sampleSystemCode: RegisterItem = new SystemCode(
  'acadsin_zho-Hani_Latn_2002', '', ts, ts,
  'acadsin:zho-Hani:Latn:2002',
  'Academia Sinica -- Tongyong Pinyin',
  'Description', 'acadsin', 'zho-Hani', null, null, 'Latn',
  '2002', [], 'proposed', 'historical',
);

describe('SemanticExporter implementations', () => {
  const items: RegisterItem[] = [sampleAuthority, sampleSystemCode];

  describe.each([
    ['JsonLdExporter', new JsonLdExporter(), 'json-ld'],
    ['TurtleExporter', new TurtleExporter(), 'turtle'],
    ['RdfXmlExporter', new RdfXmlExporter(), 'rdf-xml'],
  ] as const)('%s', (_name, exporter, expectedFormat) => {
    it(`declares its format as ${expectedFormat}`, () => {
      expect(exporter.format).toBe(expectedFormat);
    });

    it('exportItem produces a non-empty string containing the item UUID', () => {
      for (const item of items) {
        const out = exporter.exportItem(item);
        expect(typeof out).toBe('string');
        expect(out.length).toBeGreaterThan(0);
        expect(out).toContain(item.uuid);
      }
    });
  });

  describe('JsonLdExporter specifics', () => {
    const ex = new JsonLdExporter();
    it('produces parseable JSON containing @context', () => {
      const out = JSON.parse(ex.exportItem(sampleAuthority));
      expect(out['@context']).toBe('https://schema.org');
      expect(out['@type']).toBe('Organization');
      expect(out['name']).toBe('Academia Sinica');
    });
  });

  describe('RdfXmlExporter specifics', () => {
    const ex = new RdfXmlExporter();
    it('produces XML containing rdf:RDF root', () => {
      const out = ex.exportItem(sampleSystemCode);
      expect(out).toContain('<?xml version="1.0"');
      expect(out).toContain('<rdf:RDF');
      expect(out).toContain('</rdf:RDF>');
    });
  });

  describe('TurtleExporter specifics', () => {
    const ex = new TurtleExporter();
    it('emits prefix declarations', () => {
      const out = ex.exportItem(sampleSystemCode);
      expect(out).toContain('@prefix');
      expect(out).toContain('iso24229:');
    });
  });
});
