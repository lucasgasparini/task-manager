import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: [],
    // Run tests sequentially to avoid DB conflicts between test files
    pool: 'forks',
    poolOptions: { forks: { singleFork: true } },
  },
})
