export function getChecksumRegex(length: number): RegExp {
  const checksumLine = `[a-fA-F0-9]{${length}} \\d+ \\S+`
  return new RegExp(`^${checksumLine}(\\n${checksumLine})*$`)
}

export function transformChecksumString(s: string) {
  return s.split("\n").map((line) => {
    const [checksum, size, path] = line.trim().split(/\s+/)
    return { checksum, size: parseInt(size, 10), path }
  })
}
