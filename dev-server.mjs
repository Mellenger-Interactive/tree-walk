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
  ".mp3": "audio/mpeg", ".m4a": "audio/mp4", ".aac": "audio/aac", ".wav": "audio/wav",
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
    const headers = { "Content-Type": types[extname(file)] || "application/octet-stream", "Cache-Control": "no-store", "Accept-Ranges": "bytes" };
    // Range requests let the browser seek in audio (GitHub Pages supports these too)
    const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || "");
    if (m) {
      const start = m[1] ? Number(m[1]) : Math.max(body.length - Number(m[2]), 0);
      const end = m[1] && m[2] ? Math.min(Number(m[2]), body.length - 1) : body.length - 1;
      if (start > end || start >= body.length) return res.writeHead(416, { "Content-Range": `bytes */${body.length}` }).end();
      res.writeHead(206, { ...headers, "Content-Range": `bytes ${start}-${end}/${body.length}`, "Content-Length": end - start + 1 });
      return res.end(body.subarray(start, end + 1));
    }
    res.writeHead(200, { ...headers, "Content-Length": body.length });
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
