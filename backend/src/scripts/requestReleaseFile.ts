import { fetchReleaseFile } from "@/util/deb/fetching"
import { generateDebianSuites, generateUbuntuSuites } from "@/util/deb/suites"
import { isCancel, select, log, tasks, intro } from "@clack/prompts"
import { writeFile } from "fs/promises"

intro("Request Release File")

const repositoryUrl = await select({
  message: "Repository URL",
  options: [
    { value: "http://deb.debian.org/debian", label: "Debian" },
    { value: "http://archive.ubuntu.com/ubuntu", label: "Ubuntu" },
  ],
})

if (isCancel(repositoryUrl)) {
  log.error("No repository URL selected, exiting.")
  process.exit(1)
}

const distributions = {
  "http://deb.debian.org/debian": generateDebianSuites(["trixie", "bookworm", "bullseye"]),
  "http://archive.ubuntu.com/ubuntu": generateUbuntuSuites(["resolute", "questing", "noble", "jammy"]),
}

const distribution = await select({
  message: "Distribution",
  options: distributions[repositoryUrl].map(value => ({ value, label: value })),
})

if (isCancel(distribution)) {
  log.error("No distribution selected, exiting.")
  process.exit(1)
}

log.info(`Selected repository: ${repositoryUrl}`)
log.info(`Selected distribution: ${distribution}`)

await tasks([
  {
    title: "Fetching release file...",
    task: async () => {
      const releaseFile = await fetchReleaseFile(`${repositoryUrl}/dists/${distribution}`)
      const hostName = new URL(repositoryUrl).host
      const fileName = `${hostName}-${distribution}-Release.json`
      await writeFile(`${import.meta.dirname}/${fileName}`, JSON.stringify(releaseFile, null, 2))
      return `Saved to ${fileName}`
    },
  },
])
