import { fetchPackagesFile, fetchReleaseFile } from "@/util/deb/fetching"
import type { Package } from "@/util/deb/schemas"
import { serve } from "@hono/node-server"
import { Hono } from "hono"

const app = new Hono()

app.get("/", async (c) => {
  // const releaseFile = await fetchReleaseFile("http://archive.ubuntu.com/ubuntu", "resolute")
  const releaseFile = await fetchReleaseFile("https://deb.debian.org/debian/", "trixie")

  let log = ""
  const almightyPackageList: Package[] = []

  for (const component of releaseFile.components) {
    for (const arch of releaseFile.architectures) {
      // const packages = await fetchPackagesFile("http://archive.ubuntu.com/ubuntu", "resolute", component, arch)
      const packages = await fetchPackagesFile("https://deb.debian.org/debian/", "trixie", component, arch)
      log += `Component: ${component}, Arch: ${arch}, Packages: ${packages.length}\n`
      console.log(`Component: ${component}, Arch: ${arch}, Packages: ${packages.length}`)
      almightyPackageList.push(...packages)
    }
  }

  log += `Total packages: ${almightyPackageList.length}\n`

  console.log("Finding openssl packages...")
  const opensslPackages = almightyPackageList.filter(pkg => pkg.package === "openssl")
  log += `Found ${opensslPackages.length} openssl packages:\n`
  for (const pkg of opensslPackages) {
    log += ` - ${pkg.package} ${pkg.version} (${pkg.architecture})\n`
  }

  return c.text(log)
})

serve({
  fetch: app.fetch,
  port: 3000,
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
