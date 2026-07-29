import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "AutoDoc Rec Studio", timestamp: new Date().toISOString() });
  });

  // Website preview CORS proxy endpoint
  // Allows loading external websites in iframe previews even if X-Frame-Options or CSP blocks standard iframes
  app.get("/api/proxy", async (req, res) => {
    const targetUrl = req.query.url as string;
    if (!targetUrl) {
      res.status(400).send("Missing target URL parameter 'url'");
      return;
    }

    try {
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(targetUrl.startsWith("http") ? targetUrl : `https://${targetUrl}`);
      } catch {
        res.status(400).send("Invalid URL format");
        return;
      }

      const response = await fetch(parsedUrl.toString(), {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 AutoDocRec/1.0",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });

      const contentType = response.headers.get("content-type") || "text/html";
      res.setHeader("Content-Type", contentType);
      // Remove frame restrictions
      res.removeHeader("X-Frame-Options");
      res.removeHeader("Content-Security-Policy");
      res.setHeader("Access-Control-Allow-Origin", "*");

      if (contentType.includes("text/html")) {
        let html = await response.text();
        // Inject base tag so relative links resolve properly inside proxied iframe
        const baseHref = parsedUrl.origin + parsedUrl.pathname;
        if (html.includes("<head>")) {
          html = html.replace("<head>", `<head><base href="${baseHref}">`);
        } else if (html.includes("<HEAD>")) {
          html = html.replace("<HEAD>", `<HEAD><base href="${baseHref}">`);
        } else {
          html = `<base href="${baseHref}">${html}`;
        }
        res.send(html);
      } else {
        const buffer = await response.arrayBuffer();
        res.send(Buffer.from(buffer));
      }
    } catch (error: any) {
      console.error("Proxy error:", error);
      res.status(500).send(`Failed to fetch website: ${error.message}`);
    }
  });

  // Website metadata info endpoint
  app.get("/api/website-info", async (req, res) => {
    const targetUrl = req.query.url as string;
    if (!targetUrl) {
      res.status(400).json({ error: "Missing url parameter" });
      return;
    }

    try {
      const parsedUrl = new URL(targetUrl.startsWith("http") ? targetUrl : `https://${targetUrl}`);
      const response = await fetch(parsedUrl.toString(), {
        headers: {
          "User-Agent": "Mozilla/5.0 AutoDocRec/1.0",
        },
      });
      const html = await response.text();

      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : parsedUrl.hostname;

      res.json({
        title,
        hostname: parsedUrl.hostname,
        url: parsedUrl.toString(),
        favicon: `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=64`,
      });
    } catch (err: any) {
      res.json({
        title: targetUrl,
        hostname: targetUrl,
        url: targetUrl,
        favicon: null,
      });
    }
  });

  // Vite middleware setup for dev / Static file serving for prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AutoDoc Rec Studio Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
