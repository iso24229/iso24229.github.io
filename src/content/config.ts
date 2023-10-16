import { z, reference, defineCollection } from 'astro:content';

const remarkable = {
  remarks: z.string(),
};

const timestampable = {
  createdAt: z.string().transform((val: string) => new Date(val)),
  updatedAt: z.string().transform((val: string) => new Date(val)),
};

const authorityCollection = defineCollection({
  type: 'data',
  schema: z.object({
    authorityIdentifier: z.string(),
    name: z.string(),
    ...remarkable,
    ...timestampable,
  }),
});

const codeStatusCollection = defineCollection({
  type: 'data',
  schema: z.object({
    codeStatus: z.string(),
    ...remarkable,
    ...timestampable,
  }),
});

const spellingSystemCollection = defineCollection({
  type: 'data',
  schema: z.object({
    languageCode: z.string().optional(),
    scriptCode: z.string(),
    countryCode: z.string().optional(),
    extension: z.string(),
    ...remarkable,
    ...timestampable,
  }),
});

const systemCodeCollection = defineCollection({
  type: 'data',
  schema: z.object({
    code: z.string(),
    name: z.string(),
    authority: reference('authority'),
    sourceSpelling: reference('spelling-system'),
    targetSpelling: reference('spelling-system'),
    identifyingSegment: z.string(),
    relations: z.array(reference('system-relation')),
    codeStatus: reference('code-status'),
    systemStatus: reference('system-status'),
    ...remarkable,
    ...timestampable,
  }),
});

const systemRelationCollection = defineCollection({
  type: 'data',
  schema: z.object({
    type: z.string(),
    targetSystem: reference('system-code'),
    ...remarkable,
    ...timestampable,
  }),
});

const systemRelationTypeCollection = defineCollection({
  type: 'data',
  schema: z.object({
    systemRelationType: z.string(),
    ...remarkable,
    ...timestampable,
  }),
});

const systemStatusCollection = defineCollection({
  type: 'data',
  schema: z.object({
    systemStatus: z.string(),
    ...remarkable,
    ...timestampable,
  }),
});

export const collections = {
  'authority': authorityCollection,
  'code-status': codeStatusCollection,
  'spelling-system': spellingSystemCollection,
  'system-code': systemCodeCollection,
  'system-relation': systemRelationCollection,
  'system-relation-type': systemRelationTypeCollection,
  'system-status': systemStatusCollection,
};
