import type { ItemClassSlug } from "./RegisterItem";
import { RegisterItem } from "./RegisterItem";

/**
 * Postal address of an authority. Schema.org `PostalAddress` aligned.
 */
export interface PostalAddress {
  readonly street: string;
  readonly city: string;
  readonly country: string; // ISO 3166-1 alpha-2
  readonly postalCode: string;
}

export interface ContactInfo {
  readonly email?: string;
  readonly url?: string;
}

export interface AuthorisedPerson {
  readonly name: string;
  readonly role: string;
  readonly email: string;
}

/**
 * An authority that maintains one or more written-language conversion systems.
 *
 * Per ISO 24229 Annex A, each authority must designate exactly two
 * authorised persons. This invariant is enforced by the Zod schema
 * (length === 2) before construction; the constructor trusts its input.
 */
export class Authority extends RegisterItem {
  constructor(
    uuid: string,
    remarks: string,
    createdAt: Date,
    updatedAt: Date,
    public readonly authorityIdentifier: string,
    public readonly name: string,
    public readonly address: PostalAddress,
    public readonly contact: ContactInfo,
    public readonly authorisedPersons: readonly [AuthorisedPerson, AuthorisedPerson],
  ) {
    super(uuid, remarks, createdAt, updatedAt);
  }

  get itemClass(): ItemClassSlug {
    return "authority";
  }

  get displayName(): string {
    return this.name;
  }
}
