import {defineConfig} from "vitest/config"

export default defineConfig({
    test: {
        global: true,
        environment: "node",
        include: ["test/testAPI/**/*/*.test.ts"],
        setupFiles: ["./test/startTest.ts"],
    }
})