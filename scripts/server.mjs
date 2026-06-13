import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = process.argv[2] || ".";
const port = Number(process.env.PORT || 4174);

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host}`);
    const cleanPath = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "");
    const filePath = join(root, cleanPath === "/" ? "index.html" : cleanPath);
    const data = await readFile(filePath);
    res.writeHead(200, { "Content-Type": types[extname(filePath)] || "application/octet-stream" });
    res.end(data);
  } catch {
    const data = await readFile(join(root, "index.html"));
    res.writeHead(200, { "Content-Type": types[".html"] });
    res.end(data);
  }
});

server.listen(port, () => {
  console.log(`AI Native Onboarding Coach running at http://localhost:${port}/`);
});
