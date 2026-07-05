/**
 * Abstract base for all domain objects in the register.
 *
 * The register's item classes share a common shape (uuid + timestamps +
 * remarks). That shared shape lives here. Each concrete item class
 * extends `RegisterItem` and adds its own typed fields.
 *
 * Encapsulation rules:
 * - State is set via the constructor only.
 * - Mutators go through named methods that return a new instance (immutable).
 * - No `any`, no `(this as any)`, no bypassing TypeScript's visibility.
 */
export abstract class RegisterItem {
  constructor(
    public readonly uuid: string,
    public readonly remarks: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  /** Discriminator for type narrowing; set by each subclass. */
  abstract readonly itemClass: ItemClassSlug;

  /** Human-readable name for display. */
  abstract get displayName(): string;
}

export type ItemClassSlug =
  | "authority"
  | "code-status"
  | "spelling-system"
  | "system-code"
  | "system-relation"
  | "system-relation-type"
  | "system-status";
