// Local preview server for docs/ (no dependencies). Usage: npm run dev [-- --port 3000]
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { networkInterfaces } from "node:os";

const root = join(import.meta.dirname, "docs");
const i = process.argv.indexOf("--port");
const port = Number(i > -1 ? process.argv[i + 1] : process.env.PORT || 8000);
const types = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript",
  ".css": "text/css", ".json": "application/json", ".glb": "model/gltf-binary",
  ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml",
  ".mp3": "audio/mpeg", ".m4a": "audio/mp4", ".wav": "audio/wav",
};

createServer(async (req, res) => {
  const url = decodeURIComponent(new URL(req.url, "http://x").pathname);
  let file = normalize(join(root, url));
  if (!file.startsWith(root)) return res.writeHead(403).end();
  try {
    if ((await stat(file)).isDirectory()) {
      if (!url.endsWith("/")) return res.writeHead(301, { Location: url + "/" }).end();
      file = join(file, "index.html");
    }
    const body = await readFile(file);
    res.writeHead(200, { "Content-Type": types[extname(file)] || "application/octet-stream", "Cache-Control": "no-store" });
    res.end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" }).end("Not found");
  }
}).listen(port, () => {
  const lan = Object.values(networkInterfaces()).flat().find((n) => n?.family === "IPv4" && !n.internal)?.address;
  console.log(`\n  Tree Walk dev server\n`);
  console.log(`  3D viewer  http://localhost:${port}/`);
  console.log(`  Slider     http://localhost:${port}/slider/`);
  if (lan) console.log(`  On phone   http://${lan}:${port}/slider/`);
  console.log(`\n  Ctrl+C to stop\n`);
});
