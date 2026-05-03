import { Readable } from "stream"
import { pipeline } from "stream/promises"
import { createGunzip } from "zlib"

export async function gunzipBuffer(buffer: Buffer): Promise<string> {
  const gunzip = createGunzip()
  const chunks: Buffer[] = []

  await pipeline(
    Readable.from(buffer),
    gunzip,
    async function (source) {
      for await (const chunk of source) chunks.push(chunk)
    },
  )

  const text = Buffer.concat(chunks).toString("utf8")
  return text
}
