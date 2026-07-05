import { SemanticExporter } from "./SemanticExporter";
import type { RegisterItem } from "../domain/items/RegisterItem";
import type { RegisterIndex } from "../domain/register/RegisterIndex";

/**
 * JSON-LD exporter. Outputs schema.org-aligned structured data.
 */
export class JsonLdExporter extends SemanticExporter {
  readonly format = "json-ld" as const;

  exportItem(item: RegisterItem): string {
    const graph = this.itemToGraph(item);
    const jsonLd = {
      "@context": "https://schema.org",
      ...graph,
    };
    return JSON.stringify(jsonLd, null, 2);
  }

  exportIndex(index: RegisterIndex): string {
    const items = Object.values(
      index.all("system-code") as readonly RegisterItem[],
    ).concat(
      index.all("authority") as readonly RegisterItem[],
      index.all("spelling-system") as readonly RegisterItem[],
    );
    const graph = items.map((item) => this.itemToGraph(item));
    return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, null, 2);
  }
}
