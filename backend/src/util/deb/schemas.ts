import { getChecksumRegex, transformChecksumString } from "@/util/deb/checksums"
import { z } from "zod"

// Format described in https://wiki.debian.org/DebianRepository/Format#A.22Release.22_files
export const releaseFileSchema = z.object({
  // Optional Metadata
  description: z.string().nullish(),
  origin: z.string().nullish(),
  label: z.string().nullish(),

  // Metadata
  suite: z.string().min(1),
  codename: z.string().min(1),
  version: z.string().min(1).nullish(),

  // Content Information
  components: z.string().min(1).nonempty().transform(s => s.trim().split(/\s+/)),
  architectures: z.string().min(1).nonempty().transform(s => s.trim().split(/\s+/)),

  date: z.coerce.date(),
  validUntil: z.coerce.date().nullish(),

  // Checksums
  md5Sum: z.string().regex(getChecksumRegex(32)).transform(transformChecksumString).nullish(),
  sha1: z.string().regex(getChecksumRegex(40)).transform(transformChecksumString).nullish(),
  sha256: z.string().regex(getChecksumRegex(64)).transform(transformChecksumString).nullish(),
  sha512: z.string().regex(getChecksumRegex(128)).transform(transformChecksumString).nullish(),

  acquireByHash: z.enum(["yes", "no"]).transform(val => val === "yes").default(false),
})

export type ReleaseFile = z.infer<typeof releaseFileSchema>

export const packageSchema = z.object({
  // Identity
  package: z.string(),
  source: z.string().optional(),
  version: z.string(),
  architecture: z.string(),

  // Classification
  priority: z.enum(["required", "important", "standard", "optional", "extra"]).optional(),
  section: z.string().optional(),
  tag: z.string().optional(),

  // Installation
  installedSize: z.coerce.number().optional(),
  filename: z.string(),
  size: z.coerce.number(),
  phasedUpdatePercentage: z.coerce.number().min(0).max(100).optional(),

  // Checksums
  md5sum: z.string().regex(/^[a-f0-9]{32}$/).optional(),
  sha1: z.string().regex(/^[a-f0-9]{40}$/).optional(),
  sha256: z.string().regex(/^[a-f0-9]{64}$/).optional(),
  sha512: z.string().regex(/^[a-f0-9]{128}$/).optional(),

  // Dependencies
  preDepends: z.string().optional(),
  depends: z.string().optional(),
  recommends: z.string().optional(),
  suggests: z.string().optional(),
  enhances: z.string().optional(),
  breaks: z.string().optional(),
  conflicts: z.string().optional(),
  replaces: z.string().optional(),
  provides: z.string().optional(),

  // Maintainer
  maintainer: z.string().optional(),
  originalMaintainer: z.string().optional(),
  origin: z.string().optional(),
  bugs: z.string().url().optional(),

  // Multi-arch
  multiArch: z.enum(["same", "foreign", "allowed", "no"]).optional(),

  // Description
  description: z.string().optional(),
  descriptionMd5: z.string().length(32).optional(),
  homepage: z.string().url().optional(),

  // Ubuntu extensions
  task: z.string().optional(),
  commands: z.string().optional(),
})

export type Package = z.infer<typeof packageSchema>
export type PackagesFile = Package[]
