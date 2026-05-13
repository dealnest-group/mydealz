import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      // Industry standard coverage gates (Google/Microsoft baseline).
      // Each tested package must hit these floors before merge.
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
      include: ['src/**/*.ts'],
      // index.ts is the tRPC bootstrap; tests cover individual routers/procedures.
      // Add new files to include as their tests land.
      exclude: ['src/**/*.d.ts', 'src/__tests__/**'],
    },
  },
})
