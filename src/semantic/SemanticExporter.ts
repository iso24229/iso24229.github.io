/**
 * Abstract base for all semantic-data exporters.
 *
 * Each subclass implements `exportItem` (single register item) and
 * `exportIndex` (the whole register, or a slice). Adding a new format
 * = adding a new subclass. Adding a new item class = override the
 * per-class hook method.
 *
 * This is the open/closed pattern: the abstract base is closed for
 * modification; new formats or item classes extend it without touching
 * existing code.
 */
import type { RegisterItem } from "../domain/items/RegisterItem";
import type { Authority } from "../domain/items/Authority";
import type { SpellingSystem } from "../domain/items/SpellingSystem";
import type { SystemCode } from "../domain/items/SystemCode";
import type { RegisterIndex } from "../domain/register/RegisterIndex";

export abstract class SemanticExporter {
  abstract readonly format: "json-ld" | "turtle" | "rdf-xml";

  /** Serialise a single item to a string in this exporter's format. */
  abstract exportItem(item: RegisterItem): string;

  /** Serialise the entire register (or a slice) to a string. */
  abstract exportIndex(index: RegisterIndex): string;

  /** Discriminated dispatch — override per item class in subclasses if needed. */
  protected itemToGraph(item: RegisterItem): Record<string, unknown> {
    switch (item.itemClass) {
      case "authority":
        return this.authorityToGraph(item as Authority);
      case "spelling-system":
        return this.spellingSystemToGraph(item as SpellingSystem);
      case "system-code":
        return this.systemCodeToGraph(item as SystemCode);
      default:
        return { "@id": `urn:iso24229:${item.itemClass}:${item.uuid}`, "@type": "DefinedTerm", name: item.displayName };
    }
  }

  protected authorityToGraph(auth: Authority): Record<string, unknown> {
    return {
      "@id": `urn:iso24229:authority:${auth.uuid}`,
      "@type": "Organization",
      identifier: auth.authorityIdentifier,
      name: auth.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: auth.address.street,
        addressLocality: auth.address.city,
        addressCountry: auth.address.country,
        postalCode: auth.address.postalCode,
      },
      contactPoint: auth.contact.email
        ? { "@type": "ContactPoint", email: auth.contact.email }
        : undefined,
    };
  }

  protected spellingSystemToGraph(sp: SpellingSystem): Record<string, unknown> {
    return {
      "@id": `urn:iso24229:spelling-system:${sp.uuid}`,
      "@type": "Language",
      identifier: sp.displayName,
      inLanguage: sp.languageCode,
      inScript: sp.scriptCode,
    };
  }

  protected systemCodeToGraph(sc: SystemCode): Record<string, unknown> {
    return {
      "@id": `urn:iso24229:system-code:${sc.uuid}`,
      "@type": "DefinedTerm",
      termCode: sc.code,
      name: sc.name,
      description: sc.description,
      authority: sc.authority ? { "@id": `urn:iso24229:authority:${sc.authority}` } : null,
      sourceSpelling: sc.sourceSpelling
        ? { "@id": `urn:iso24229:spelling-system:${sc.sourceSpelling}` }
        : sc.sourceScriptCode,
      targetSpelling: sc.targetSpelling
        ? { "@id": `urn:iso24229:spelling-system:${sc.targetSpelling}` }
        : sc.targetScriptCode,
      identifyingSegment: sc.identifyingSegment,
      codeStatus: sc.codeStatus,
      systemStatus: sc.systemStatus,
    };
  }
}
