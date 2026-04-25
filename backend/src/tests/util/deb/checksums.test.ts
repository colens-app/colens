import { getChecksumRegex, transformChecksumString } from "@/util/deb/checksums"
import { describe, expect, test } from "vitest"

describe("getChecksumRegex", () => {
  test("matches a single valid line", () => {
    expect(getChecksumRegex(64).test("a".repeat(64) + " 1234 main/binary-amd64/Packages")).toBe(true)
  })

  test("matches multiple valid lines", () => {
    const line = "a".repeat(64) + " 1234 main/binary-amd64/Packages"
    expect(getChecksumRegex(64).test(`${line}\n${line}`)).toBe(true)
  })

  test("rejects wrong checksum length", () => {
    expect(getChecksumRegex(64).test("a".repeat(63) + " 1234 main/binary-amd64/Packages")).toBe(false)
  })

  test("rejects non-hex checksum", () => {
    expect(getChecksumRegex(64).test("z".repeat(64) + " 1234 main/binary-amd64/Packages")).toBe(false)
  })

  test("rejects missing size", () => {
    expect(getChecksumRegex(64).test("a".repeat(64) + " main/binary-amd64/Packages")).toBe(false)
  })

  test("rejects malformed second line", () => {
    const validLine = "a".repeat(64) + " 1234 main/binary-amd64/Packages"
    expect(getChecksumRegex(64).test(`${validLine}\nnot-valid`)).toBe(false)
  })

  test("rejects empty string", () => {
    expect(getChecksumRegex(64).test("")).toBe(false)
  })
})

describe("transformChecksumString", () => {
  test("parses a single line", () => {
    expect(transformChecksumString("a".repeat(64) + " 1234 main/binary-amd64/Packages")).toEqual([
      { checksum: "a".repeat(64), size: 1234, path: "main/binary-amd64/Packages" },
    ])
  })

  test("parses multiple lines", () => {
    const input = [
      "a".repeat(64) + " 1234 main/binary-amd64/Packages",
      "b".repeat(64) + " 5678 main/binary-amd64/Packages.gz",
    ].join("\n")
    expect(transformChecksumString(input)).toEqual([
      { checksum: "a".repeat(64), size: 1234, path: "main/binary-amd64/Packages" },
      { checksum: "b".repeat(64), size: 5678, path: "main/binary-amd64/Packages.gz" },
    ])
  })

  test("parses size as integer", () => {
    const result = transformChecksumString("a".repeat(64) + " 42 some/file")
    expect(result[0].size).toBe(42)
    expect(typeof result[0].size).toBe("number")
  })
})
