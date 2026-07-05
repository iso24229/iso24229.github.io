import { SemanticExporter } from "./SemanticExporter";
import type { RegisterItem } from "../domain/items/RegisterItem";
import type { RegisterIndex } from "../domain/register/RegisterIndex";

/**
 * Turtle (TTL) exporter. RDF/N3-style serialisation.
 *
 * Uses the `iso24229:` prefix for the register's own vocabulary and
 * standard prefixes for rdf, rdfs, schema, and xsd.
 */
const PREFIX = [
  "@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .",
  "@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .",
  "@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .",
  "@prefix schema: <https://schema.org/> .",
  "@prefix iso24229: <https://www.iso24229.org/ns/> .",
].join("\n");

function escape(s: string): string {
  return s.replace(/["\\\n\r]/g, (c) => `\\${c === "\n" ? "n" : c === "\r" ? "r" : c}`);
}

export class TurtleExporter extends SemanticExporter {
  readonly format = "turtle" as const;

  exportItem(item: RegisterItem): string {
    return [PREFIX, "", this.itemToTurtle(item), ""].join("\n");
  }

  exportIndex(index: RegisterIndex): string {
    const items = (index.all("system-code") as readonly RegisterItem[])
      .concat(
        index.all("authority") as readonly RegisterItem[],
        index.all("spelling-system") as readonly RegisterItem[],
      );
    return [PREFIX, "", ...items.map((i) => this.itemToTurtle(i)), ""].join("\n");
  }

  private itemToTurtle(item: RegisterItem): string {
    const subj = `<urn:iso24229:${item.itemClass}:${item.uuid}>`;
    const lines: string[] = [`${subj} a iso24229:${item.itemClass} ;`];
    lines.push(`    rdfs:label "${escape(item.displayName)}" ;`);
    lines.push(`    schema:identifier "${escape(item.uuid)}" .`);
    return lines.join("\n");
  }
}
