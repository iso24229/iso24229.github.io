import type { ItemClassSlug } from "../items/RegisterItem";
import { RegisterItem } from "./RegisterItem";

/**
 * A registered written-language conversion system.
 *
 * Source and target may each be expressed as either a spelling-system
 * reference (when the language is specified) or a bare ISO 15924 script
 * code (when the language is irrelevant). The Zod schema enforces that
 * exactly one of the two fields is set per side.
 */
export class SystemCode extends RegisterItem {
  constructor(
    uuid: string,
    remarks: string,
    createdAt: Date,
    updatedAt: Date,
    public readonly code: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly authority: string | null,
    public readonly sourceSpelling: string | null,
    public readonly sourceScriptCode: string | null,
    public readonly targetSpelling: string | null,
    public readonly targetScriptCode: string | null,
    public readonly identifyingSegment: string,
    public readonly relations: readonly string[],
    public readonly codeStatus: string,
    public readonly systemStatus: string,
  ) {
    super(uuid, remarks, createdAt, updatedAt);
  }

  get itemClass(): ItemClassSlug {
    return "system-code";
  }

  get displayName(): string {
    return this.name;
  }

  /** The four colon-separated segments of `code`. */
  get codeSegments(): readonly [string, string, string, string] {
    const parts = this.code.split(":");
    if (parts.length !== 4) {
      throw new Error(`Invalid system-code: expected 4 segments, got ${parts.length} in "${this.code}"`);
    }
    return parts as [string, string, string, string];
  }

  get titularSegment(): string {
    return this.codeSegments[0];
  }
  get sourceSegment(): string {
    return this.codeSegments[1];
  }
  get targetSegment(): string {
    return this.codeSegments[2];
  }
}
