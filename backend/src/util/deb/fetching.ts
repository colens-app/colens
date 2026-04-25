import { stripTrailingSlash } from "../urls.js"
import { parseStanza } from "./parsing.js"
import { releaseFileSchema, type ReleaseFile } from "./schemas.js"

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
