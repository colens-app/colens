const UBUNTU_SUITE_SUFFIXES = ["", "-updates", "-backports", "-security"] as const
const DEBIAN_SUITE_SUFFIXES = ["", "-updates", "-backports"] as const

function generateSuites(
  release: string | string[],
  suiteSuffixes: readonly string[],
) {
  const releases = Array.isArray(release) ? release : [release]
  return releases.flatMap(r => suiteSuffixes.map(suffix => `${r}${suffix}`))
}

export function generateUbuntuSuites(release: string | string[]) {
  return generateSuites(release, UBUNTU_SUITE_SUFFIXES)
}

export function generateDebianSuites(release: string | string[]) {
  return generateSuites(release, DEBIAN_SUITE_SUFFIXES)
}
