export function toCamelCase(s: string) {
  return s.split(/[-_]|(?<=[a-z])(?=[A-Z])|(?<=\d)(?=[A-Z])/)
    .map((w, i) => i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join("")
}
