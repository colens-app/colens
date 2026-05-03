import { toCamelCaseKnown } from "@/util/strings"
import { ParseError } from "@/util/errors"

// folded vs multiline can't be inferred from context, so we have to define it
const fieldTypes: Record<string, "multiline" | "folded"> = {
  uploaders: "folded",
  binary: "folded",
  buildDepends: "folded",
  depends: "folded",
  tag: "folded",

  description: "multiline",
  md5Sum: "multiline",
  sha1: "multiline",
  sha256: "multiline",
  sha512: "multiline",
}

export function parseStanza(stanza: string, singleStanza?: false): Record<string, string | null>[]
export function parseStanza(stanza: string, singleStanza: true): Record<string, string | null> | null
export function parseStanza(stanza: string, singleStanza: boolean = false): Record<string, string | null>[] | Record<string, string | null> | null {
  const trimmedStanza = stanza.trim()

  const stanzas = trimmedStanza.split("\n\n")
  const results: Record<string, string | null>[] = []

  for (const stanzaBlock of stanzas) {
    if (stanzaBlock.trim().length === 0) continue

    const parsed = parseSingleStanza(stanzaBlock)
    if (parsed !== null) results.push(parsed)
  }

  if (singleStanza && results.length > 1) {
    throw new ParseError(`Expected single stanza but found ${results.length}`)
  }

  return singleStanza ? results[0] ?? null : results
}

export function parseSingleStanza(stanza: string): Record<string, string | null> | null {
  if (stanza.trim().length === 0) return null

  const result: Record<string, string | null> = {}
  const lines = stanza.split("\n")
  let currentKey: string | null = null
  let hasContent = false

  for (const line of lines) {
    if (line.charCodeAt(0) === 35) continue // '#' comment

    if (line.length === 0) {
      throw new ParseError("Unexpected blank line within stanza")
    }

    const firstChar = line.charCodeAt(0)
    if (firstChar === 9 || firstChar === 32) { // tab or space - this is a continuation line
      // We must know the field type to know how to handle the continuation - we can't tell folded/multiline apart otherwise
      if (!currentKey || !fieldTypes[currentKey]) {
        throw new ParseError(`Continuation line on unregistered or unknown field (currentKey: ${currentKey}): ${line}`)
      }
      const value = line.slice(1)

      if (fieldTypes[currentKey] === "multiline") {
        const finalValue = value === "." ? "" : value // a single dot on a continuation line represents an empty line
        result[currentKey] = result[currentKey] ? `${result[currentKey]}\n${finalValue}` : finalValue
        continue
      } else if (fieldTypes[currentKey] === "folded") {
        const trimmedValue = value.trim()
        result[currentKey] = result[currentKey] ? `${result[currentKey]} ${trimmedValue}` : trimmedValue
        continue
      }
    }

    const colonIndex = line.indexOf(":")
    if (colonIndex !== -1) {
      const key = line.slice(0, colonIndex)
      const value = line.slice(colonIndex + 1).trim()
      const normalisedKey = toCamelCaseKnown(key)
      result[normalisedKey] = value === "" ? null : value
      currentKey = normalisedKey
      hasContent = true
      continue
    }

    throw new ParseError(`Invalid line: ${line}`)
  }

  return hasContent ? result : null
}
