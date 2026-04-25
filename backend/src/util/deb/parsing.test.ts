import { expect, test, describe } from "vitest"
import { parseStanza } from "./parsing.js"

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

  test("trailing blank line does not affect single stanza result", () => {
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

  test("multiple trailing blank lines don't produce extra stanzas", () => {
    expect(parseStanza("Package: foo\n\n\n")).toEqual([{ package: "foo" }])
  })
})

test("normalises keys via toCamelCase", () => {
  expect(parseStanza("Valid-Until: tomorrow", true)).toEqual({ validUntil: "tomorrow" })
})

describe("parseStanza - realistic debian release file", () => {
  const releaseStanza = `
Suite: stable
Codename: bookworm
Version: 12.0
Components: main contrib non-free
Architectures: amd64 arm64
MD5Sum: abc123
SHA256: def456
Acquire-By-Hash: yes
`.trim()

  test("parses full release stanza", () => {
    expect(parseStanza(releaseStanza, true)).toEqual({
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
})

describe("parseStanza - multi stanza splitting", () => {
  test("parses two stanzas separated by blank line", () => {
    const input = "Package: foo\n\nPackage: bar"
    expect(parseStanza(input)).toEqual([{ package: "foo" }, { package: "bar" }])
  })

  test("ignores leading blank lines", () => {
    const input = "\nPackage: foo"
    expect(parseStanza(input)).toEqual([{ package: "foo" }])
  })

  test("handles trailing blank line", () => {
    const input = "Package: foo\n"
    expect(parseStanza(input)).toEqual([{ package: "foo" }])
  })
})

describe("parseStanza - multiline fields", () => {
  test("SHA256 continuation lines are appended with newline", () => {
    const input = [
      "SHA256:",
      " abc123 1234 main/binary-amd64/Packages",
      " def456 5678 main/binary-amd64/Packages.gz",
    ].join("\n")
    expect(parseStanza(input, true)).toEqual({
      sha256: "abc123 1234 main/binary-amd64/Packages\ndef456 5678 main/binary-amd64/Packages.gz",
    })
  })

  test("a lone dot in a multiline field becomes an empty line", () => {
    const input = "SHA256:\n abc123 100 foo\n .\n def456 200 bar"
    expect(parseStanza(input, true)).toEqual({
      sha256: "abc123 100 foo\n\ndef456 200 bar",
    })
  })

  test("multiline first line null when empty", () => {
    const input = "SHA256:\n abc123 100 foo"
    const result = parseStanza(input, true)
    // first line is empty → null, continuation replaces it
    expect(result).toEqual({ sha256: "abc123 100 foo" })
  })
})

describe("parseStanza - folded fields", () => {
  test("continuation lines are joined with a space", () => {
    const input = "Uploaders: Alice <alice@example.com>,\n Bob <bob@example.com>"
    expect(parseStanza(input, true)).toEqual({
      uploaders: "Alice <alice@example.com>, Bob <bob@example.com>",
    })
  })

  test("multiple continuation lines", () => {
    const input = "Uploaders: Alice <a@example.com>,\n Bob <b@example.com>,\n Carol <c@example.com>"
    expect(parseStanza(input, true)).toEqual({
      uploaders: "Alice <a@example.com>, Bob <b@example.com>, Carol <c@example.com>",
    })
  })

  test("folded field with only continuation lines", () => {
    const input = "Depends:\n libfoo (>= 1.0),\n libbar"
    expect(parseStanza(input, true)).toEqual({
      depends: "libfoo (>= 1.0), libbar",
    })
  })
})

describe("parseStanza - realistic multiline release file", () => {
  const input = [
    "Suite: stable",
    "SHA256:",
    " abc123 1000 main/binary-amd64/Packages",
    " def456 2000 main/binary-amd64/Packages.gz",
    "Acquire-By-Hash: yes",
  ].join("\n")

  test("parses mixed simple and multiline fields", () => {
    expect(parseStanza(input, true)).toEqual({
      suite: "stable",
      sha256: "abc123 1000 main/binary-amd64/Packages\ndef456 2000 main/binary-amd64/Packages.gz",
      acquireByHash: "yes",
    })
  })
})
