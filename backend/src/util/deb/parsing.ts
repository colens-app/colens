import { toCamelCase } from "../strings.js"

// folded vs multiline can't be inferred from context, so we have to define it
const fieldTypes: Record<string, "multiline" | "folded"> = {
  uploaders: "folded",
  binary: "folded",
  buildDepends: "folded",
  depends: "folded",

  description: "multiline",
  md5Sum: "multiline",
  sha1: "multiline",
  sha256: "multiline",
  sha512: "multiline",
}

export function parseStanza(stanza: string, singleStanza?: false): Record<string, string | null>[]
export function parseStanza(stanza: string, singleStanza: true): Record<string, string | null> | null
export function parseStanza(stanza: string, singleStanza: boolean = false): Record<string, string | null>[] | Record<string, string | null> | null {
  const results: Record<string, string | null>[] = []
  const lines = stanza.split("\n")

  let currentStanza: Record<string, string | null> = {}

  let currentKey: string | null = null

  for (const line of lines) {
    if (line.startsWith("#")) continue // Comment

    if (line === "") { // Stanza split line
      if (Object.keys(currentStanza).length === 0) continue // Don't do anything if we haven't started a stanza yet
      results.push({ ...currentStanza })
      currentStanza = {}
      currentKey = null
      continue
    }

    const keyValueMatch = /^([!-9,;-~]+):\s*(.*?)\s*$/.exec(line)
    if (keyValueMatch) {
      const key = keyValueMatch[1]
      const value = keyValueMatch[2]

      const normalisedKey = toCamelCase(key)
      currentStanza[normalisedKey] = value === "" ? null : value
      currentKey = normalisedKey
      continue
    }

    const continuationLineMatch = /^[\t ](.+)/.exec(line)
    if (continuationLineMatch) {
      if (!currentKey || !fieldTypes[currentKey]) {
        throw new Error(`Continuation line on unregistered or unknown field (currentKey: ${currentKey}): ${line}`)
      }
      const value = continuationLineMatch[1]

      if (fieldTypes[currentKey] === "multiline") {
        const finalValue = value === "." ? "" : value // A single dot signifies a blank line

        // If the current key's value is null/empty - then the value is used as the first line, otherwise it's a new line to the value
        currentStanza[currentKey] = currentStanza[currentKey] ? `${currentStanza[currentKey]}\n${finalValue}` : finalValue
        continue
      } else if (fieldTypes[currentKey] === "folded") {
        const trimmedValue = value.trim()
        currentStanza[currentKey] = currentStanza[currentKey] ? `${currentStanza[currentKey]} ${trimmedValue}` : trimmedValue
        continue
      }
    }

    throw new Error(`Invalid line: ${line}`)
  }

  // Push the last stanza if it's not empty
  if (Object.keys(currentStanza).length > 0) results.push(currentStanza)

  return singleStanza ? results[0] ?? null : results
}
