import type { ItemClassSlug } from "../items/RegisterItem";
import { RegisterItem } from "./RegisterItem";

/**
 * A composite identifier for a language-specific way of writing.
 *
 * A spelling system consists of:
 *   language code (ISO 639)  — required
 *   script code (ISO 15924)  — required
 *   country code (ISO 3166)  — optional
 *   extension (ad-hoc)       — optional (e.g. `pre1972`)
 *
 * A bare script code (e.g. `Latn`) is NOT a spelling system; it is an
 * ISO 15924 reference value. See memory: feedback_iso_24229_data_model.
 */
export class SpellingSystem extends RegisterItem {
  constructor(
    uuid: string,
    remarks: string,
    createdAt: Date,
    updatedAt: Date,
    public readonly languageCode: string,
    public readonly scriptCode: string,
    public readonly countryCode: string | null,
    public readonly extension: string,
  ) {
    super(uuid, remarks, createdAt, updatedAt);
  }

  get itemClass(): ItemClassSlug {
    return "spelling-system";
  }

  get displayName(): string {
    return [this.languageCode, this.scriptCode, this.countryCode, this.extension || null]
      .filter((x): x is string => Boolean(x))
      .join("-");
  }
}
