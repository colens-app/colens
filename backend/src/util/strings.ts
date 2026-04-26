const camelCaseCache = new Map<string, string>()

export function toCamelCase(s: string): string {
  const cached = camelCaseCache.get(s)
  if (cached !== undefined) return cached

  // Only compute for unknown keys (first time seeing each field name)
  const result = s.split(/[-_]|(?<=[a-z])(?=[A-Z])|(?<=\d)(?=[A-Z])/)
    .filter(s => s.length > 0)
    .map((w, i) => i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join("")

  camelCaseCache.set(s, result)
  return result
}
