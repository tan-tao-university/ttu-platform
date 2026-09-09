/**
 * @ttu/cms-registry — public entry point.
 *
 * Importing this module triggers registration of all built-in component
 * definitions (see `./definitions`).
 */
import "./definitions";

export type {
  ComponentDefinition,
  ComponentCategory,
  FieldMetadata,
} from "./definition";
export { register, get, list, versions, __resetForTests } from "./registry";
export {
  resolveBackground,
  resolveAlign,
  resolveTypography,
  resolveRadius,
  resolveShadow,
  resolveSpacing,
  resolveWidth,
  sectionStyleProps,
} from "./resolve-style";
