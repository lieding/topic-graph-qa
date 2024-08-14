import type { FromSchema } from 'json-schema-to-ts';
import * as schemas from './schemas';

export type PostV1BodyParam = FromSchema<typeof schemas.PostV1.body>;
export type PostV1MetadataParam = FromSchema<typeof schemas.PostV1.metadata>;
export type PostV1Response200 = FromSchema<typeof schemas.PostV1.response['200']>;
export type PostV1Response400 = FromSchema<typeof schemas.PostV1.response['400']>;
