import { setup, teardown } from "./setup"
import { beforeAll, afterAll } from "vitest"

beforeAll(async () => {
    await setup()
})

afterAll(async () => {
    await teardown()
})