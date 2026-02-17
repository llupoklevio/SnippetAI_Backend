import {defineConfig} from "vitest/config"

export default defineConfig({
    test: {
        global: true,
        environment: "node",
        include: ["test/testAPI/**/*.ts"],
        setupFiles: ["./test/setup.ts"],
    }
})