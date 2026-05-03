import { fetchPackagesFile, fetchReleaseFile } from "@/util/deb/fetching"
import { isCancel, select, log, tasks, intro, spinner, multiselect } from "@clack/prompts"
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
  "https://deb.debian.org/debian/": ["trixie", "bookworm", "bullseye"],
  "http://archive.ubuntu.com/ubuntu": ["resolute", "questing", "noble", "jammy"],
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

const releaseSpinner = spinner()

releaseSpinner.start("Fetching release file...")
const releaseFile = await fetchReleaseFile(repositoryUrl, release)
releaseSpinner.stop("Release file fetched!")

const components = await multiselect({
  message: "Select components to fetch packages for",
  options: releaseFile.components.map(value => ({ value, label: value })),
})

if (isCancel(components)) {
  log.error("No components selected, exiting.")
  process.exit(1)
}

const architectures = await multiselect({
  message: "Select architectures to fetch packages for",
  options: releaseFile.architectures.map(value => ({ value, label: value })),
})

if (isCancel(architectures)) {
  log.error("No architectures selected, exiting.")
  process.exit(1)
}

let totalPackages = 0

await tasks(
  components.flatMap(component =>
    architectures.map(arch => ({
      title: `Fetching packages for ${component} (${arch})...`,
      task: async () => {
        const packages = await fetchPackagesFile(repositoryUrl, release, component, arch)
        const hostName = new URL(repositoryUrl).host
        const fileName = `${hostName}-${release}-${component}-${arch}-Packages.json`
        await writeFile(`${import.meta.dirname}/${fileName}`, JSON.stringify(packages, null, 2))
        totalPackages += packages.length
        return `Saved to ${fileName} - ${packages.length} packages fetched`
      },
    })),
  ),
)

log.info(`Total packages fetched: ${totalPackages}`)
