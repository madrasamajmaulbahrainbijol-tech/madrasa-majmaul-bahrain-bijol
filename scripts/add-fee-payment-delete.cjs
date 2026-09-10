// Fee payment deletion UI was previously injected during the build and could produce invalid JSX in Turbopack.
// Deletion authorization remains enforced by the database RPC; this build-time UI injector is intentionally disabled.
console.log('[fee-delete] build-time deletion UI injector disabled; database Super Admin protection remains active.');
