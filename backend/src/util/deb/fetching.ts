import { stripTrailingSlash } from "@/util/urls.js"
import { packageSchema, releaseFileSchema, type PackagesFile, type ReleaseFile } from "./schemas.js"
import { parseStanza } from "@/util/deb/parsing.js"
import { gunzipBuffer } from "@/util/compression.js"

export async function fetchReleaseFile(repositoryUrl: string, distribution: string): Promise<ReleaseFile> {
  const normalisedUrl = stripTrailingSlash(repositoryUrl)
  // TODO: handle gpg, maybe use InRelease instead of Release?
  // TODO: validate distribution to not be a path traversal - either upstream or here
  const indexUrl = `${normalisedUrl}/dists/${distribution}/Release`
  const response = await fetch(indexUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch repository index: ${response.status} ${response.statusText}`)
  }
  const text = await response.text()
  const indexData = parseStanza(text, true)

  if (indexData == null) {
    throw new Error(`Empty Release file!`)
  }

  const parseResult = releaseFileSchema.parse(indexData)

  return parseResult
}

export async function fetchPackagesFile(repositoryUrl: string, distribution: string, component: string, arch: string): Promise<PackagesFile> {
  const normalisedUrl = stripTrailingSlash(repositoryUrl)

  const packagesUrl = `${normalisedUrl}/dists/${distribution}/${component}/binary-${arch}/Packages.gz`
  const response = await fetch(packagesUrl)

  if (!response.ok && response.status === 404) {
    // It's valid behaviour for some combinations of component/arch to not exist, so return an empty array instead of throwing
    return []
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch Packages file (${packagesUrl}): ${response.status} ${response.statusText}`)
  }
  const buffer = Buffer.from(await response.arrayBuffer())
  const text = await gunzipBuffer(buffer)

  const packagesData = parseStanza(text, false)

  if (packagesData.length === 0) {
    throw new Error(`Empty Packages file!`)
  }

  const parseResult = packagesData.map(entry => packageSchema.parse(entry))

  return parseResult
}
