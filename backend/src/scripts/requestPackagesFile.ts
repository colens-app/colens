import { fetchPackagesFile, fetchReleaseFile } from "@/util/deb/fetching"
import { generateDebianSuites, generateUbuntuSuites } from "@/util/deb/suites"
import { isCancel, select, log, tasks, intro, spinner, multiselect } from "@clack/prompts"
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

const releaseSpinner = spinner()

releaseSpinner.start("Fetching release file...")
const releaseFile = await fetchReleaseFile(`${repositoryUrl}/dists/${distribution}`)
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
        const packages = await fetchPackagesFile(`${repositoryUrl}/dists/${distribution}`, component, arch)
        const hostName = new URL(repositoryUrl).host
        const fileName = `${hostName}-${distribution}-${component}-${arch}-Packages.json`
        await writeFile(`${import.meta.dirname}/${fileName}`, JSON.stringify(packages, null, 2))
        totalPackages += packages.length
        return `Saved to ${fileName} - ${packages.length} packages fetched`
      },
    })),
  ),
)

log.info(`Total packages fetched: ${totalPackages}`)
