/**
 * Pure factory functions: parsed YAML (validated by Zod in content.config.ts)
 * → typed domain class instances.
 *
 * Each factory is a pure function over its input. The factories are the
 * only place that knows how to instantiate each subclass — pages never
 * call `new SystemCode(...)` directly.
 *
 * Adding a new item class = adding a factory here + registering it in
 * `itemFactories`.
 */
import type { ItemClassSlug } from "./items/RegisterItem";
import type { RegisterItem } from "./items/RegisterItem";
import { Authority } from "./items/Authority";
import { CodeStatus, SystemRelation, SystemRelationType, SystemStatus } from "./items/EnumItems";
import { SpellingSystem } from "./items/SpellingSystem";
import { SystemCode } from "./items/SystemCode";

export type FactoryInput = Readonly<Record<string, unknown>>;

type Factory = (input: FactoryInput) => RegisterItem;

const toDate = (v: unknown): Date => (v instanceof Date ? v : new Date(v as string));

const asString = (v: unknown, fallback = ""): string =>
  typeof v === "string" ? v : fallback;

const asNullableString = (v: unknown): string | null =>
  typeof v === "string" && v.length > 0 ? v : null;

const asStringArray = (v: unknown): readonly string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

const factoryAuthority: Factory = (input) =>
  new Authority(
    asString(input.uuid),
    asString(input.remarks),
    toDate(input.createdAt),
    toDate(input.updatedAt),
    asString(input.authorityIdentifier),
    asString(input.name),
    {
      street: asString((input.address as Record<string, unknown> | undefined)?.street),
      city: asString((input.address as Record<string, unknown> | undefined)?.city),
      country: asString((input.address as Record<string, unknown> | undefined)?.country),
      postalCode: asString((input.address as Record<string, unknown> | undefined)?.postalCode),
    },
    {
      email: asNullableString((input.contact as Record<string, unknown> | undefined)?.email) ?? undefined,
      url: asNullableString((input.contact as Record<string, unknown> | undefined)?.url) ?? undefined,
    },
    input.authorisedPersons as [AuthorisedPersonLike, AuthorisedPersonLike],
  );

interface AuthorisedPersonLike {
  readonly name: string;
  readonly role: string;
  readonly email: string;
}

const factorySpellingSystem: Factory = (input) =>
  new SpellingSystem(
    asString(input.uuid),
    asString(input.remarks),
    toDate(input.createdAt),
    toDate(input.updatedAt),
    asString(input.languageCode),
    asString(input.scriptCode),
    asNullableString(input.countryCode),
    asString(input.extension),
  );

const factorySystemCode: Factory = (input) =>
  new SystemCode(
    asString(input.uuid),
    asString(input.remarks),
    toDate(input.createdAt),
    toDate(input.updatedAt),
    asString(input.code),
    asString(input.name),
    asNullableString(input.description),
    asNullableString(input.authority),
    asNullableString(input.sourceSpelling),
    asNullableString(input.sourceScriptCode),
    asNullableString(input.targetSpelling),
    asNullableString(input.targetScriptCode),
    asString(input.identifyingSegment),
    asStringArray(input.relations),
    asString(input.codeStatus),
    asString(input.systemStatus),
  );

const factorySystemRelation: Factory = (input) =>
  new SystemRelation(
    asString(input.uuid),
    asString(input.remarks),
    toDate(input.createdAt),
    toDate(input.updatedAt),
    asString(input.type),
    asString(input.targetSystem),
  );

const factorySystemRelationType: Factory = (input) =>
  new SystemRelationType(
    asString(input.uuid),
    asString(input.remarks),
    toDate(input.createdAt),
    toDate(input.updatedAt),
    asString(input.systemRelationType),
  );

const factoryCodeStatus: Factory = (input) =>
  new CodeStatus(
    asString(input.uuid),
    asString(input.remarks),
    toDate(input.createdAt),
    toDate(input.updatedAt),
    asString(input.codeStatus),
  );

const factorySystemStatus: Factory = (input) =>
  new SystemStatus(
    asString(input.uuid),
    asString(input.remarks),
    toDate(input.createdAt),
    toDate(input.updatedAt),
    asString(input.systemStatus),
  );

export const itemFactories: Record<ItemClassSlug, Factory> = {
  authority: factoryAuthority,
  "code-status": factoryCodeStatus,
  "spelling-system": factorySpellingSystem,
  "system-code": factorySystemCode,
  "system-relation": factorySystemRelation,
  "system-relation-type": factorySystemRelationType,
  "system-status": factorySystemStatus,
};
