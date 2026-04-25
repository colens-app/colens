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
