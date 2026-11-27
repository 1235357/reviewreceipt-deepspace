import { defineConfig } from 'vitest/config'
export default defineConfig({test:{include:['src/scope/**/*.test.ts'],environment:'node'}})
