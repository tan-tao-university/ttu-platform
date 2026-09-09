/**
 * Component definitions registry entry point.
 *
 * Side-effect import: each file calls `register(...)` at module load.
 * Importing this folder guarantees all definitions are registered
 * before any code calls `get(key, version)`.
 */
export { heroDefinition } from "./hero";
export { statisticsDefinition } from "./statistics";
export { richTextDefinition } from "./rich-text";
export { ctaDefinition } from "./cta";
export { imageTextDefinition } from "./image-text";
export { newsGridDefinition } from "./news-grid";
export { eventListDefinition } from "./event-list";
export { announcementListDefinition } from "./announcement-list";
export { facultyGridDefinition } from "./faculty-grid";
export { partnerLogosDefinition } from "./partner-logos";
export { quickLinksDefinition } from "./quick-links";
