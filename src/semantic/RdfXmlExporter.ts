import { SemanticExporter } from "./SemanticExporter";
import type { RegisterItem } from "../domain/items/RegisterItem";
import type { RegisterIndex } from "../domain/register/RegisterIndex";

/**
 * RDF/XML exporter. The most verbose of the three formats; suitable
 * for tooling that expects classical RDF/XML.
 */
function escapeXml(s: string): string {
  return s.replace(/[<>&"']/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case '"': return "&quot;";
      case "'": return "&apos;";
      default: return c;
    }
  });
}

export class RdfXmlExporter extends SemanticExporter {
  readonly format = "rdf-xml" as const;

  exportItem(item: RegisterItem): string {
    return [
      `<?xml version="1.0" encoding="UTF-8"?>`,
      `<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"`,
      `         xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"`,
      `         xmlns:schema="https://schema.org/"`,
      `         xmlns:iso24229="https://www.iso24229.org/ns/">`,
      `  <iso24229:${item.itemClass} rdf:about="urn:iso24229:${item.itemClass}:${item.uuid}">`,
      `    <rdfs:label>${escapeXml(item.displayName)}</rdfs:label>`,
      `    <schema:identifier>${escapeXml(item.uuid)}</schema:identifier>`,
      `  </iso24229:${item.itemClass}>`,
      `</rdf:RDF>`,
      "",
    ].join("\n");
  }

  exportIndex(index: RegisterIndex): string {
    const items = (index.all("system-code") as readonly RegisterItem[])
      .concat(
        index.all("authority") as readonly RegisterItem[],
        index.all("spelling-system") as readonly RegisterItem[],
      );
    return [
      `<?xml version="1.0" encoding="UTF-8"?>`,
      `<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"`,
      `         xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"`,
      `         xmlns:schema="https://schema.org/"`,
      `         xmlns:iso24229="https://www.iso24229.org/ns/">`,
      ...items.map((i) =>
        `  <iso24229:${i.itemClass} rdf:about="urn:iso24229:${i.itemClass}:${i.uuid}">` +
        `<rdfs:label>${escapeXml(i.displayName)}</rdfs:label>` +
        `</iso24229:${i.itemClass}>`,
      ),
      `</rdf:RDF>`,
      "",
    ].join("\n");
  }
}
