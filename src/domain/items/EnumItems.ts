import type { ItemClassSlug } from "../items/RegisterItem";
import { RegisterItem } from "./RegisterItem";

/** Enum-like register entries: code-status, system-status, system-relation-type. */
export class CodeStatus extends RegisterItem {
  constructor(
    uuid: string,
    remarks: string,
    createdAt: Date,
    updatedAt: Date,
    public readonly codeStatus: string,
  ) {
    super(uuid, remarks, createdAt, updatedAt);
  }
  get itemClass(): ItemClassSlug {
    return "code-status";
  }
  get displayName(): string {
    return this.codeStatus;
  }
}

export class SystemStatus extends RegisterItem {
  constructor(
    uuid: string,
    remarks: string,
    createdAt: Date,
    updatedAt: Date,
    public readonly systemStatus: string,
  ) {
    super(uuid, remarks, createdAt, updatedAt);
  }
  get itemClass(): ItemClassSlug {
    return "system-status";
  }
  get displayName(): string {
    return this.systemStatus;
  }
}

export class SystemRelationType extends RegisterItem {
  constructor(
    uuid: string,
    remarks: string,
    createdAt: Date,
    updatedAt: Date,
    public readonly systemRelationType: string,
  ) {
    super(uuid, remarks, createdAt, updatedAt);
  }
  get itemClass(): ItemClassSlug {
    return "system-relation-type";
  }
  get displayName(): string {
    return this.systemRelationType;
  }
}

export class SystemRelation extends RegisterItem {
  constructor(
    uuid: string,
    remarks: string,
    createdAt: Date,
    updatedAt: Date,
    public readonly type: string,
    public readonly targetSystem: string,
  ) {
    super(uuid, remarks, createdAt, updatedAt);
  }
  get itemClass(): ItemClassSlug {
    return "system-relation";
  }
  get displayName(): string {
    return `${this.type} → ${this.targetSystem}`;
  }
}
