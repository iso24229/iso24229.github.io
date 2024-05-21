import { z, reference, defineCollection } from 'astro:content';

const uuidentifiable = {
  uuid: {
    type: 'string',
    title: 'UUID',
  },
} as const;

const remarkable = {
  remarks: {
    type: 'string',
    title: 'Remarks',
  },
} as const;

const timestampable = {
  createdAt: {
    type: 'date',
    title: 'Created At',
  },
  updatedAt: {
    type: 'date',
    title: 'Updated At',
  },
} as const;

/**
 * hack to make circular type references work
 */
export interface SchemaObjectType {
  [key: string]: SchemaType;
}

interface DescriptiveSchemaType {
  title?: string;
  description?: string;
  type: PrimitiveSchemaType;
}

type SchemaReferenceType = {
  ref: string;
  optional: boolean;
}

const ref = (
  itemClass: string,
  optional: boolean = false,
): SchemaReferenceType => {
  return {
    ref: itemClass,
    optional
  };
}

const isReferenceSchemaType = (s: any): s is SchemaReferenceType =>
  typeof s === 'object' && 'ref' in s && 'optional' in s;

const isDescriptiveSchemaType = (s: SchemaType): s is DescriptiveSchemaType =>
  typeof s === 'object' && 'type' in s;

const isPrimitiveSchemaType = (s: SchemaType): s is PrimitiveSchemaType =>
  ! isReferenceSchemaType(s) && ! isDescriptiveSchemaType(s);

type SchemaArrayType = Array<SchemaType>;

export type SchemaType =
| PrimitiveSchemaType
| DescriptiveSchemaType
;

export type PrimitiveSchemaType =
| 'number'
| 'string'
| 'date'
| 'number?'
| 'string?'
| 'date?'
| SchemaReferenceType
| SchemaArrayType
| string
;

/**
 * hack to make circular type references work
 */
export interface CompoundZodType {
  [key: string]: _CompoundZodType;
}

type _CompoundZodType =
| CompoundZodType
| Array<CompoundZodType>
| z.ZodObject<any>
| z.ZodType
;

export const primitiveTypeOf = (s: SchemaType): PrimitiveSchemaType => {
  if (isDescriptiveSchemaType(s)) {
    return s.type;
  }
  else if (Array.isArray(s)) {
    return s.map(primitiveTypeOf);
  }
  else {
    return s;
  }
}

export const titleOf = (k: string, s: SchemaType): string => {
  if (isDescriptiveSchemaType(s)) {
    return s.title ?? '';
  }
  else if (Array.isArray(s)) {
    return titleOf(k, s[0]);
  }
  else {
    return k;
  }
}

export const transformSchemaToZodSchema = (s: SchemaObjectType): z.ZodRawShape => {
  const zodSchema: z.ZodRawShape = {};
  Object.entries(s).forEach(([key, value]) => {
    zodSchema[key] = transformPrimitiveSchemaToZodSchema(primitiveTypeOf(value));
  });
  return zodSchema;
}

const transformPrimitiveSchemaToZodSchema = (s: PrimitiveSchemaType): z.ZodTypeAny => {
  switch(s) {
    case 'date':
      return z.string().transform((val: string) => new Date(val));
    case 'date?':
      return z.string().transform((val: string) => new Date(val)).optional();
    case 'number':
      return z.number();
    case 'number?':
      return z.number().optional();
    case 'string':
      return z.string();
    case 'string?':
      return z.string().optional();
    default:
      if (Array.isArray(s)) {
        return z.array(
          transformPrimitiveSchemaToZodSchema(
            primitiveTypeOf(s[0])
          )
        );
      }
      else {
        if (isReferenceSchemaType(s)) {
          const res = reference(s.ref);
          if (s.optional) {
            return res.optional();
          }
          else {
            return res;
          }
        }
      }
  }
  return z.object({});
}

const commonTraits = {
  ...uuidentifiable,
  ...remarkable,
  ...timestampable,
};

const def = (schema: z.ZodType) => defineCollection({
  schema,
  type: 'data',
});

export const itemClasses = [
  'authority',
  'code-status',
  'spelling-system',
  'system-code',
  'system-relation',
  'system-relation-type',
  'system-status',
] as const;

export type ItemClass = typeof itemClasses[number];

export type RichItemClassSchema = {
  title: string;
  description?: string | null;
  schema: SchemaObjectType;
};

export type RichItemClassCollection = RichItemClassSchema & { collection: ReturnType<typeof def> };

export interface VersionedSchemaWithRichData {
  version: string;
  fields: Record<ItemClass, RichItemClassSchema>;
}

/**
 * TODO: Turn this to source from some config file / URL.
 */
export const versionedSchemaWithRichData: VersionedSchemaWithRichData = {
  version: '1',
  fields: {
    'authority': {
      title: 'Authority',
      schema: {
        authorityIdentifier: {
          title: 'Authority Identifier',
          type: 'string',
        },
        name: {
          title: 'Name',
          type: 'string',
        },
        ...commonTraits,
      },
    },
    'code-status': {
      title: 'Code Status',
      schema: {
        codeStatus: 'string',
        ...commonTraits,
      },
    },
    'spelling-system': {
      title: 'Spelling System',
      schema: {
        languageCode: 'string?',
        scriptCode: 'string',
        countryCode: 'string?',
        extension: 'string',
        ...commonTraits,
      },
    },
    'system-code': {
      title: 'System Code',
      schema: {
        code: 'string',
        name: 'string',
        authority: ref('authority'),
        sourceSpelling: ref('spelling-system'),
        targetSpelling: ref('spelling-system'),
        identifyingSegment: 'string',
        relations: [ref('system-relation')],
        codeStatus: ref('code-status'),
        systemStatus: ref('system-status'),
        ...commonTraits,
      },
    },
    'system-relation': {
      title: 'System Relation',
      schema: {
        type: 'string',
        targetSystem: ref('system-code'),
        ...commonTraits,
      },
    },
    'system-relation-type': {
      title: 'System Relation Type',
      schema: {
        systemRelationType: 'string',
        ...commonTraits,
      },
    },
    'system-status': {
      title: 'System Status',
      schema: {
        systemStatus: 'string',
        ...commonTraits,
      },
    },
  }
};

export const schemaWithRichData: Record<ItemClass, RichItemClassSchema> = versionedSchemaWithRichData.fields;

export const schemas: Record<ItemClass, SchemaObjectType> = Object.entries(schemaWithRichData).reduce((acc, [k, v]) => {
  acc[k as ItemClass] = v.schema;
  return acc;
}, {} as Record<ItemClass, SchemaObjectType>);

export const zodSchemas = Object.entries(schemas).reduce((acc, [k, v]) => {
  acc[k as ItemClass] = z.object(transformSchemaToZodSchema(v));
  return acc;
}, {} as Record<ItemClass, z.ZodType>);

export const collections = Object.entries(zodSchemas).reduce((acc, [k, v]) => {
  acc[k] = def(v);
  return acc;
}, {} as Record<string, ReturnType<typeof def>>);

export const zodCollectionsWithRichData: Record<ItemClass, RichItemClassCollection> = Object.entries(schemaWithRichData).reduce((acc, [k, v]) => {
  acc[k as ItemClass] = {
    ...v,
    collection: collections[k],
  };
  return acc;
}, {} as Record<ItemClass, RichItemClassCollection>);

export function reduceSchema<T>(schema: (typeof schemas)[ItemClass], fn: (kv: [ItemClass, SchemaType]) => T, initialValue: Record<ItemClass, T> = {} as Record<ItemClass, T>) {
  return Object.entries(schema).reduce((acc, [fieldName, type]) => {
    acc[fieldName as ItemClass] = fn([fieldName as ItemClass, type]);
    return acc;
  }, initialValue)
}

export function mapSchema<T>(schema: (typeof schemas)[ItemClass], fn: (kv: [ItemClass, SchemaType]) => T, initialValue: T[] = []) {
  return Object.entries(schema).reduce((acc, [fieldName, type]) => {
    acc.push(fn([fieldName as ItemClass, type]));
    return acc;
  }, initialValue)
}
