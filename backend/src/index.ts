import { fetchReleaseFile } from "@/util/deb/fetching"
import { serve } from "@hono/node-server"
import { Hono } from "hono"

const app = new Hono()

app.get("/", async (c) => {
  const releaseFile = await fetchReleaseFile("http://archive.ubuntu.com/ubuntu", "resolute")
  return c.json(releaseFile)
})

serve({
  fetch: app.fetch,
  port: 3000,
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
