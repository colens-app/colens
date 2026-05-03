export function generateUbuntuSuites(release: string | string[]) {
  const suiteSuffixes = ["", "-updates", "-backports", "-security"]
  if (Array.isArray(release)) {
    return release.flatMap(r => suiteSuffixes.map(suffix => `${r}${suffix}`))
  }
  return suiteSuffixes.map(suffix => `${release}${suffix}`)
}

export function generateDebianSuites(release: string | string[]) {
  const suiteSuffixes = ["", "-updates", "-backports"]
  if (Array.isArray(release)) {
    return release.flatMap(r => suiteSuffixes.map(suffix => `${r}${suffix}`))
  }
  return suiteSuffixes.map(suffix => `${release}${suffix}`)
}
