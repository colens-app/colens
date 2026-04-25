import { describe, expect, test } from "vitest"
import { toCamelCase } from "@/util/strings.js"

describe("toCamelCase", () => {
  test("handles normal cases", () => {
    expect(toCamelCase("Upper-Kebab-Case")).toBe("upperKebabCase")
    expect(toCamelCase("lower-kebab-case")).toBe("lowerKebabCase")
    expect(toCamelCase("UpperCamelCase")).toBe("upperCamelCase")
    expect(toCamelCase("lowerCamelCase")).toBe("lowerCamelCase")

    // Real cases
    expect(toCamelCase("Date")).toBe("date")
    expect(toCamelCase("Valid-Until")).toBe("validUntil")
    expect(toCamelCase("Acquire-By-Hash")).toBe("acquireByHash")
    expect(toCamelCase("SHA256")).toBe("sha256")
    expect(toCamelCase("MD5Sum")).toBe("md5Sum")
  })

  test("handles trailing separator", () => {
    expect(toCamelCase("Foo-")).toBe("foo")
  })

  test("handles consecutive separators", () => {
    expect(toCamelCase("Foo--Bar")).toBe("fooBar")
  })

  test("handles leading separator", () => {
    expect(toCamelCase("-Foo")).toBe("foo")
  })
})
