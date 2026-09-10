/** One field-level validation failure, shaped to drop directly into the API's error envelope. */
export interface SectionValidationIssue {
  field: string;
  code: string;
  message: string;
}

/** Doc 02 §11: "Component không tồn tại trong registry" is rejected before any schema check runs. */
export class ComponentNotRegisteredError extends Error {
  constructor(
    public readonly componentKey: string,
    public readonly componentVersion: number,
  ) {
    super(`Component "${componentKey}" version ${componentVersion} is not registered`);
    this.name = 'ComponentNotRegisteredError';
  }
}

/**
 * Doc 03 §13: content/config/style failed the component's own schema — unknown fields, a missing
 * required field, or a value outside the allowed shape (including an invalid style token).
 */
export class SectionValidationError extends Error {
  constructor(public readonly issues: SectionValidationIssue[]) {
    super('Section content/config/style failed validation');
    this.name = 'SectionValidationError';
  }
}
