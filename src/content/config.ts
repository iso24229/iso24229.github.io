import { z, reference, defineCollection } from 'astro:content';

const remarkable = {
  remarks: z.string(),
};

const timestampable = {
  createdAt: z.string().transform((val: string) => new Date(val)),
  updatedAt: z.string().transform((val: string) => new Date(val)),
};

const commonTraits = {
  ...remarkable,
  ...timestampable,
};

const def = ({ schema } : { schema: z.ZodType<any, z.ZodTypeDef, any> }) => defineCollection({
  type: 'data',
  schema,
});

const authorityCollection = def({
  schema: z.object({
    authorityIdentifier: z.string(),
    name: z.string(),
    ...commonTraits,
  }),
});

const codeStatusCollection = def({
  schema: z.object({
    codeStatus: z.string(),
    ...commonTraits,
  }),
});

const spellingSystemCollection = def({
  schema: z.object({
    languageCode: z.string().optional(),
    scriptCode: z.string(),
    countryCode: z.string().optional(),
    extension: z.string(),
    ...commonTraits,
  }),
});

const systemCodeCollection = def({
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
    ...commonTraits,
  }),
});

const systemRelationCollection = def({
  schema: z.object({
    type: z.string(),
    targetSystem: reference('system-code'),
    ...commonTraits,
  }),
});

const systemRelationTypeCollection = def({
  schema: z.object({
    systemRelationType: z.string(),
    ...commonTraits,
  }),
});

const systemStatusCollection = def({
  schema: z.object({
    systemStatus: z.string(),
    ...commonTraits,
  }),
});

export const collections = {
  'authority': {
    collection: authorityCollection,
    title: 'Authority',
    // description: 'lorem ipsum dolor sit amet consectetur adipiscing elit. sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  },
  'code-status': {
    collection: codeStatusCollection,
    title: 'Code Status',
  },
  'spelling-system': {
    collection: spellingSystemCollection,
    title: 'Spelling System',
  },
  'system-code': {
    collection: systemCodeCollection,
    title: 'System Code',
  },
  'system-relation': {
    collection: systemRelationCollection,
    title: 'System Relation',
  },
  'system-relation-type': {
    collection: systemRelationTypeCollection,
    title: 'System Relation Type',
  },
  'system-status': {
    collection: systemStatusCollection,
    title: 'System Status',
  },
};

export const itemClasses = Object.keys(collections);
