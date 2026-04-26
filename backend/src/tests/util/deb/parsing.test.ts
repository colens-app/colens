import { expect, test, describe } from "vitest"
import { parseSingleStanza, parseStanza } from "@/util/deb/parsing.js"

describe("parseSingleStanza", () => {
  test("single key-value pair", () => {
    expect(parseSingleStanza("Package: Hello")).toEqual({ package: "Hello" })
  })

  test("returns null for empty/whitespace input", () => {
    expect(parseSingleStanza("")).toBeNull()
    expect(parseSingleStanza("   ")).toBeNull()
  })

  test("empty value becomes null", () => {
    expect(parseSingleStanza("Package: ")).toEqual({ package: null })
  })

  test("ignores comment lines", () => {
    expect(parseSingleStanza("# This is a comment\nPackage: Hello")).toEqual({ package: "Hello" })
  })

  test("trims whitespace from values", () => {
    expect(parseSingleStanza("Package:   Hello   ")).toEqual({ package: "Hello" })
  })

  test("normalises keys via toCamelCase", () => {
    expect(parseSingleStanza("Valid-Until: tomorrow")).toEqual({ validUntil: "tomorrow" })
  })

  test("blank lines within block are ignored", () => {
    expect(parseSingleStanza("Package: foo\n\nVersion: 1.0")).toEqual({
      package: "foo",
      version: "1.0",
    })
  })

  test("throws on continuation line before any key", () => {
    expect(() => parseSingleStanza(" continuation before key")).toThrow()
  })

  test("throws on continuation line on unregistered field", () => {
    expect(() => parseSingleStanza("Package: foo\n continuation")).toThrow()
  })

  test("throws on invalid line", () => {
    expect(() => parseSingleStanza("not a valid line")).toThrow()
  })

  describe("multiline fields", () => {
    test("continuation lines are appended with newline", () => {
      const input = [
        "SHA256:",
        " abc123 1234 main/binary-amd64/Packages",
        " def456 5678 main/binary-amd64/Packages.gz",
      ].join("\n")
      expect(parseSingleStanza(input)).toEqual({
        sha256: "abc123 1234 main/binary-amd64/Packages\ndef456 5678 main/binary-amd64/Packages.gz",
      })
    })

    test("a lone dot becomes an empty line", () => {
      expect(parseSingleStanza("SHA256:\n abc123 100 foo\n .\n def456 200 bar")).toEqual({
        sha256: "abc123 100 foo\n\ndef456 200 bar",
      })
    })

    test("empty first line replaced by first continuation", () => {
      expect(parseSingleStanza("SHA256:\n abc123 100 foo")).toEqual({
        sha256: "abc123 100 foo",
      })
    })
  })

  describe("folded fields", () => {
    test("continuation lines are joined with a space", () => {
      expect(parseSingleStanza("Uploaders: Alice <alice@example.com>,\n Bob <bob@example.com>")).toEqual({
        uploaders: "Alice <alice@example.com>, Bob <bob@example.com>",
      })
    })

    test("multiple continuation lines", () => {
      const input = "Uploaders: Alice <a@example.com>,\n Bob <b@example.com>,\n Carol <c@example.com>"
      expect(parseSingleStanza(input)).toEqual({
        uploaders: "Alice <a@example.com>, Bob <b@example.com>, Carol <c@example.com>",
      })
    })

    test("folded field with only continuation lines", () => {
      expect(parseSingleStanza("Depends:\n libfoo (>= 1.0),\n libbar")).toEqual({
        depends: "libfoo (>= 1.0), libbar",
      })
    })
  })

  describe("realistic inputs", () => {
    test("parses debian release stanza", () => {
      const input = `Suite: stable
Codename: bookworm
Version: 12.0
Components: main contrib non-free
Architectures: amd64 arm64
MD5Sum: abc123
SHA256: def456
Acquire-By-Hash: yes`.trim()

      expect(parseSingleStanza(input)).toEqual({
        suite: "stable",
        codename: "bookworm",
        version: "12.0",
        components: "main contrib non-free",
        architectures: "amd64 arm64",
        md5Sum: "abc123",
        sha256: "def456",
        acquireByHash: "yes",
      })
    })

    test("parses mixed simple and multiline fields", () => {
      const input = [
        "Suite: stable",
        "SHA256:",
        " abc123 1000 main/binary-amd64/Packages",
        " def456 2000 main/binary-amd64/Packages.gz",
        "Acquire-By-Hash: yes",
      ].join("\n")

      expect(parseSingleStanza(input)).toEqual({
        suite: "stable",
        sha256: "abc123 1000 main/binary-amd64/Packages\ndef456 2000 main/binary-amd64/Packages.gz",
        acquireByHash: "yes",
      })
    })
  })
})

describe("parseStanza - single stanza mode", () => {
  test("single key-value pair", () => {
    expect(parseStanza("Package: Hello", true)).toEqual({ package: "Hello" })
  })

  test("multiple key-value pairs", () => {
    expect(parseStanza("Package: Hello\nResult: true", true)).toEqual({
      package: "Hello",
      result: "true",
    })
  })

  test("returns null for empty input", () => {
    expect(parseStanza("", true)).toBeNull()
  })

  test("empty value becomes null", () => {
    expect(parseStanza("Package: ", true)).toEqual({ package: null })
  })

  test("ignores comment lines", () => {
    expect(parseStanza("# This is a comment\nPackage: Hello", true)).toEqual({ package: "Hello" })
  })

  test("trims whitespace from values", () => {
    expect(parseStanza("Package:   Hello   ", true)).toEqual({ package: "Hello" })
  })

  test("trailing blank line does not affect result", () => {
    expect(parseStanza("Package: foo\n", true)).toEqual({ package: "foo" })
  })
})

describe("parseStanza - multi stanza mode", () => {
  test("returns array for default (no second arg)", () => {
    expect(parseStanza("Package: Hello")).toEqual([{ package: "Hello" }])
  })

  test("returns array for explicit false", () => {
    expect(parseStanza("Package: Hello", false)).toEqual([{ package: "Hello" }])
  })

  test("returns empty array for empty input", () => {
    expect(parseStanza("", false)).toEqual([])
  })

  test("parses two stanzas separated by blank line", () => {
    expect(parseStanza("Package: foo\n\nPackage: bar")).toEqual([
      { package: "foo" },
      { package: "bar" },
    ])
  })

  test("ignores leading blank lines", () => {
    expect(parseStanza("\nPackage: foo")).toEqual([{ package: "foo" }])
  })

  test("handles trailing blank line", () => {
    expect(parseStanza("Package: foo\n")).toEqual([{ package: "foo" }])
  })

  test("multiple trailing blank lines don't produce extra stanzas", () => {
    expect(parseStanza("Package: foo\n\n\n")).toEqual([{ package: "foo" }])
  })
})

describe("parseStanza - single stanza mode errors", () => {
  test("throws when multiple stanzas present in single stanza mode", () => {
    expect(() => parseStanza("Package: foo\n\nPackage: bar", true)).toThrow(
      "Expected single stanza but found 2",
    )
  })

  test("throws with correct count for three stanzas", () => {
    expect(() => parseStanza("Package: foo\n\nPackage: bar\n\nPackage: baz", true)).toThrow(
      "Expected single stanza but found 3",
    )
  })
})
