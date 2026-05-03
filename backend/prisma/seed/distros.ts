import { PrismaClient } from "../../src/generated/prisma/client"
import { v7 as uuidv7 } from "uuid"
import { DistroCreateInput } from "../../src/generated/prisma/models"

export async function seedDistros(prisma: PrismaClient) {
  const createData: DistroCreateInput[] = [
    {
      id: uuidv7(),
      name: "ubuntu",
      family: "deb",
    },
    {
      id: uuidv7(),
      name: "debian",
      family: "deb",
    },
  ]

  for (const distro of createData) {
    const existing = await prisma.distro.findUnique({ where: { name_family: { name: distro.name, family: distro.family } } })
    if (existing) {
      console.log(`Distro already exists: ${distro.name} (${distro.family})`)
      continue
    }
    await prisma.distro.create({ data: distro })
    console.log(`Created distro: ${distro.name} (${distro.family})`)
  }
}

export async function seedUbuntuReleases(prisma: PrismaClient) {
  const ubuntu = await prisma.distro.findUnique({ where: { name_family: { name: "ubuntu", family: "deb" } } })
  if (!ubuntu) throw new Error("Ubuntu distro not found")

  const ubuntuReleases = await fetch("https://endoflife.date/api/ubuntu.json").then(res => res.json())

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filteredReleases = ubuntuReleases.filter((r: any) => {
    if (!r.lts) return false
    const supportDate = new Date(r.support)
    const eolDate = new Date(r.eol)
    const maxSupportDate = supportDate > eolDate ? supportDate : eolDate
    return maxSupportDate > new Date()
  })

  for (const release of filteredReleases) {
    const codeName = release.codename.split(" ")[0].toLowerCase()
    const slug = `${release.cycle}-${codeName}`
    const existing = await prisma.distroRelease.findUnique({ where: { distroId_slug: { distroId: ubuntu.id, slug } } })
    if (existing) {
      console.log(`Distro release already exists: ${release.cycle} (${codeName})`)
      continue
    }
    await prisma.distroRelease.create({
      data: {
        id: uuidv7(),
        distroId: ubuntu.id,
        codename: codeName,
        version: release.cycle,
        slug,
      },
    })
    console.log(`Created distro release: ${release.cycle} (${codeName})`)
  }
}

export async function seedDebianReleases(prisma: PrismaClient) {
  const debian = await prisma.distro.findUnique({ where: { name_family: { name: "debian", family: "deb" } } })
  if (!debian) throw new Error("Debian distro not found")

  const debianReleases = await fetch("https://endoflife.date/api/debian.json").then(res => res.json())

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filteredReleases = debianReleases.filter((r: any) => {
    const extendedSupportDate = new Date(r.extendedSupport)
    return extendedSupportDate > new Date()
  })

  for (const release of filteredReleases) {
    const codeName = release.codename.toLowerCase()
    const slug = `${release.cycle}-${codeName}`
    const existing = await prisma.distroRelease.findUnique({ where: { distroId_slug: { distroId: debian.id, slug } } })
    if (existing) {
      console.log(`Distro release already exists: ${release.cycle} (${codeName})`)
      continue
    }
    await prisma.distroRelease.create({
      data: {
        id: uuidv7(),
        distroId: debian.id,
        codename: codeName,
        version: release.cycle,
        slug,
      },
    })
    console.log(`Created distro release: ${release.cycle} (${codeName})`)
  }
}
