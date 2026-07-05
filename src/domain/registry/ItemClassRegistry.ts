/**
 * Registry of all item-class types. Adding a new item class = adding
 * one entry here plus a new subclass file.
 *
 * Open/closed: this map is the only place that knows the full set.
 * Pages, renderers, and exporters iterate this map's keys rather than
 * hardcoding a list.
 */
import { Authority } from "../items/Authority";
import { CodeStatus, SystemRelation, SystemRelationType, SystemStatus } from "../items/EnumItems";
import { SpellingSystem } from "../items/SpellingSystem";
import { SystemCode } from "../items/SystemCode";
import type { ItemClassSlug } from "../items/RegisterItem";

export type ItemClassConstructor =
  | typeof Authority
  | typeof SpellingSystem
  | typeof SystemCode
  | typeof SystemRelation
  | typeof SystemRelationType
  | typeof CodeStatus
  | typeof SystemStatus;

export const itemClassRegistry: Record<ItemClassSlug, ItemClassConstructor> = {
  authority: Authority,
  "code-status": CodeStatus,
  "spelling-system": SpellingSystem,
  "system-code": SystemCode,
  "system-relation": SystemRelation,
  "system-relation-type": SystemRelationType,
  "system-status": SystemStatus,
};

export const itemClassSlugs = Object.keys(itemClassRegistry) as ItemClassSlug[];
