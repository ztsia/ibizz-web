// TypeScript shim for custom path aliases used in the web package
// Declares modules for imports like '#/composables/...' so editors and type-checkers
// can resolve the alias even when path mappings are not picked up.
declare module '#/*' {
  const anyExport: any;
  export default anyExport;
}

declare module '#/composables/*' {
  const anyExport: any;
  export default anyExport;
}
