/**
 * In-memory lookup index over the entire register.
 *
 * Singleton per build. Pages, exporters, and the lifecycle-graph builder
 * consume this — they never call `getCollection()` directly.
 *
 * The index is built once (on first access) and cached. It exposes
 * O(1) lookups by uuid/code and walks relations in O(degree).
 */
import type { ItemClassSlug } from "../items/RegisterItem";
import type { Authority } from "../items/Authority";
import type { SpellingSystem } from "../items/SpellingSystem";
import type { SystemCode } from "../items/SystemCode";
import type { SystemRelation } from "../items/EnumItems";
import type { RegisterItem } from "../items/RegisterItem";
import { itemClassSlugs } from "../registry/ItemClassRegistry";
import { itemFactories } from "../factories";

type ItemClassMap = Map<string, RegisterItem>;

export class RegisterIndex {
  private readonly byClass: Readonly<Record<ItemClassSlug, ItemClassMap>>;
  private readonly systemCodeIndex: Map<string, SystemCode>;

  private constructor(byClass: Record<ItemClassSlug, ItemClassMap>) {
    this.byClass = byClass;
    this.systemCodeIndex = new Map(
      [...(byClass["system-code"].values() as IterableIterator<SystemCode>)].map(
        (sc) => [sc.code, sc] as const,
      ),
    );
  }

  /**
   * Build the index by calling `getCollection` for every registered item class.
   *
   * We accept a `getCollection` typed loosely (returning unknown entries)
   * rather than Astro's stricter ` astro:content` type to avoid the
   * generic-incompatibility pain at the call site. The factory functions
   * validate the shape of each entry before construction.
   */
  static async load(
    getCollection: (collection: string) => Promise<Array<{ id: string; data: unknown }>>,
  ): Promise<RegisterIndex> {
    const byClass = {} as Record<ItemClassSlug, ItemClassMap>;
    for (const slug of itemClassSlugs) {
      const entries = await getCollection(slug);
      const map: ItemClassMap = new Map();
      for (const entry of entries) {
        const factory = itemFactories[slug];
        const item = factory(entry.data as Record<string, unknown>);
        map.set(item.uuid, item);
      }
      byClass[slug] = map;
    }
    return new RegisterIndex(byClass);
  }

  /** Look up any item by its item class + uuid. */
  byUuid<T extends RegisterItem>(itemClass: ItemClassSlug, uuid: string): T | undefined {
    return this.byClass[itemClass].get(uuid) as T | undefined;
  }

  /** All items of a given class, in insertion order. */
  all(itemClass: ItemClassSlug): readonly RegisterItem[] {
    return [...this.byClass[itemClass].values()];
  }

  /** Look up a system-code by its full colon-form `code` value. */
  systemCodeByCode(code: string): SystemCode | undefined {
    return this.systemCodeIndex.get(code);
  }

  /** The authority for a given system-code, if any. */
  authorityOf(systemCode: SystemCode): Authority | undefined {
    if (!systemCode.authority) return undefined;
    return this.byUuid<Authority>("authority", systemCode.authority);
  }

  /** Source spelling of a system-code, or null when bare-script. */
  sourceSpellingOf(systemCode: SystemCode): SpellingSystem | null {
    if (!systemCode.sourceSpelling) return null;
    return this.byUuid<SpellingSystem>("spelling-system", systemCode.sourceSpelling) ?? null;
  }

  /** Target spelling of a system-code, or null when bare-script. */
  targetSpellingOf(systemCode: SystemCode): SpellingSystem | null {
    if (!systemCode.targetSpelling) return null;
    return this.byUuid<SpellingSystem>("spelling-system", systemCode.targetSpelling) ?? null;
  }

  /** All systems maintained by an authority. */
  systemsOfAuthority(authority: Authority): readonly SystemCode[] {
    return this.all("system-code").filter(
      (item): item is SystemCode =>
        item.itemClass === "system-code" && (item as SystemCode).authority === authority.uuid,
    );
  }

  /** All relations that point to or from the given system-code. */
  relationsOf(systemCode: SystemCode): readonly SystemRelation[] {
    return this.all("system-relation").filter(
      (item): item is SystemRelation =>
        item.itemClass === "system-relation" &&
        (item as SystemRelation).targetSystem === systemCode.uuid,
    );
  }
}
