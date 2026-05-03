import { PrismaClient } from "../../src/generated/prisma/client"
import { v7 as uuidv7 } from "uuid"
import { fetchReleaseFile } from "../../src/util/deb/fetching"
import { generateUbuntuSuites } from "../../src/util/deb/suites"

export async function seedUbuntuRepositories(prisma: PrismaClient) {
  const releases = await prisma.distroRelease.findMany({
    where: {
      distro: {
        name: "ubuntu",
        family: "deb",
      },
    },
  })

  for (const release of releases) {
    if (!release.codename) {
      console.log(`Skipping release without codename: ${release.version}`)
      continue
    }
    const distributions = generateUbuntuSuites(release.codename)
    for (const distribution of distributions) {
      const url = `http://archive.ubuntu.com/ubuntu/dists/${distribution}`
      const existing = await prisma.repository.findFirst({ where: { baseUrl: url } })
      if (existing) {
        console.log(`Repository already exists: ${url}`)
        continue
      }

      const releaseFile = await fetchReleaseFile(url)

      await prisma.repository.create({
        data: {
          id: uuidv7(),
          distroId: release.distroId,
          releaseId: release.id,
          baseUrl: url,
          name: `Ubuntu ${release.version} (${distribution})`,
          config: {
            distribution: distribution,
            suite: releaseFile.suite,
            codename: releaseFile.codename,
            components: releaseFile.components,
            architectures: releaseFile.architectures,
          },
        },
      })
      console.log(`Created repository for release: ${release.slug} (${distribution})`)
    }
  }
}
