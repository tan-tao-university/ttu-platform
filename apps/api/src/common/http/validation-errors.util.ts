import type { ValidationError } from 'class-validator';
import type { ApiErrorDetail } from './api-error';

/** Flattens class-validator's `ValidationError` tree (nested via `.children` for arrays and
 *  nested DTOs) into the `errors[]` shape design doc 06 §15 specifies — one entry per failed
 *  constraint, with a dotted/indexed `field` path like `sections[2].content.title`. */
export function flattenValidationErrors(
  errors: ValidationError[],
  parentPath = '',
): ApiErrorDetail[] {
  return errors.flatMap((error) => {
    const path = parentPath ? `${parentPath}.${error.property}` : error.property;
    const own = Object.entries(error.constraints ?? {}).map(([code, message]) => ({
      field: path,
      code,
      message,
    }));
    const nested = error.children?.length ? flattenValidationErrors(error.children, path) : [];
    return [...own, ...nested];
  });
}
