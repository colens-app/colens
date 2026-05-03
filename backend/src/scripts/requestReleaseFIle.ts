import { fetchReleaseFile } from "@/util/deb/fetching"
import { generateDebianSuites, generateUbuntuSuites } from "@/util/deb/suites"
import { isCancel, select, log, tasks, intro } from "@clack/prompts"
import { writeFile } from "fs/promises"

intro("Request Release File")

const repositoryUrl = await select({
  message: "Repository URL",
  options: [
    { value: "https://deb.debian.org/debian/", label: "Debian" },
    { value: "http://archive.ubuntu.com/ubuntu", label: "Ubuntu" },
  ],
})

if (isCancel(repositoryUrl)) {
  log.error("No repository URL selected, exiting.")
  process.exit(1)
}

const releases = {
  "https://deb.debian.org/debian/": generateDebianSuites(["trixie", "bookworm", "bullseye"]),
  "http://archive.ubuntu.com/ubuntu": generateUbuntuSuites(["resolute", "questing", "noble", "jammy"]),
}

const release = await select({
  message: "Release",
  options: releases[repositoryUrl].map(value => ({ value, label: value })),
})

if (isCancel(release)) {
  log.error("No release selected, exiting.")
  process.exit(1)
}

log.info(`Selected repository: ${repositoryUrl}`)
log.info(`Selected release: ${release}`)

await tasks([
  {
    title: "Fetching release file...",
    task: async () => {
      const releaseFile = await fetchReleaseFile(`${repositoryUrl}/dists/${release}`)
      const hostName = new URL(repositoryUrl).host
      const fileName = `${hostName}-${release}-Release.json`
      await writeFile(`${import.meta.dirname}/${fileName}`, JSON.stringify(releaseFile, null, 2))
      return `Saved to ${fileName}`
    },
  },
])
