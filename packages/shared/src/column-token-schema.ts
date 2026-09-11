/**
 * Numeric column option for Zod schema use.
 * Zod's `z.enum()` infers string literals; for numeric choices we use
 * `z.union` of literals instead so that the schema's output type matches
 * `ColumnToken` (number literal) without a coercion step at the boundary.
 *
 * Kept in a separate file so that `@ttu/shared`'s barrel (`./index.ts`)
 * does not pull `zod` into the Edge middleware bundle via `style-tokens.ts`.
 * Only server-side consumers (cms-registry) import this file directly.
 */
import { z } from "zod";

export const ColumnTokenSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(6),
]);
