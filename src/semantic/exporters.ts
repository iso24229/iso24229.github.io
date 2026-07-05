/**
 * Registry of semantic-data exporters. Adding a new format = adding
 * an entry here. The site's data endpoints iterate this map rather
 * than hardcoding each format.
 *
 * Open/closed: the rest of the codebase depends on this map's
 * shape, never on individual exporter classes.
 */
import { JsonLdExporter } from "./JsonLdExporter";
import { TurtleExporter } from "./TurtleExporter";
import { RdfXmlExporter } from "./RdfXmlExporter";
import type { SemanticExporter } from "./SemanticExporter";

export const semanticExporters: Record<string, SemanticExporter> = {
  "json-ld": new JsonLdExporter(),
  ttl: new TurtleExporter(),
  rdf: new RdfXmlExporter(),
};

export type SemanticFormat = keyof typeof semanticExporters;
