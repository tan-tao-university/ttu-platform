import { heroV1 } from './components/hero';
import { registerComponent } from './registry';

registerComponent(heroV1);

export {
  ComponentNotRegisteredError,
  SectionValidationError,
  type SectionValidationIssue,
} from './errors';
export {
  getComponentDefinition,
  listComponents,
  registerComponent,
  resetRegistry,
  validateSection,
  validateSectionContent,
  validateSectionStructure,
  type SectionContentInput,
  type SectionInput,
  type SectionStructureInput,
  type ValidatedSection,
  type ValidatedSectionStructure,
} from './registry';
export {
  ALIGNMENT_TOKENS,
  BACKGROUND_TOKENS,
  RADIUS_TOKENS,
  SHADOW_TOKENS,
  SPACING_TOKENS,
  TYPOGRAPHY_TOKENS,
  WIDTH_TOKENS,
  alignmentToken,
  backgroundToken,
  radiusToken,
  shadowToken,
  spacingToken,
  typographyToken,
  widthToken,
} from './style-tokens';
export {
  COMPONENT_CATEGORIES,
  COMPONENT_LIFECYCLE_STATES,
  FIELD_TYPES,
  type ComponentCategory,
  type ComponentDefinition,
  type ComponentLifecycleState,
  type EditorFieldMetadata,
  type FieldType,
} from './types';
