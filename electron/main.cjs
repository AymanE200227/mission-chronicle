const { app, BrowserWindow, shell } = require("electron");
const path = require("path");
const http = require("http");

const isDev = !app.isPackaged;
const SERVER_PORT = 23199;

let serverReady = false;

function startProductionServer() {
  return new Promise((resolve) => {
    const distServer = path.join(__dirname, "..", "dist", "server", "server.js");

    import(distServer).then((mod) => {
      const handler = mod.default;

      const server = http.createServer(async (req, res) => {
        const url = new URL(req.url, `http://localhost:${SERVER_PORT}`);
        const headers = new Headers();
        for (const [key, value] of Object.entries(req.headers)) {
          if (value) headers.set(key, Array.isArray(value) ? value.join(", ") : value);
        }

        const body =
          req.method !== "GET" && req.method !== "HEAD"
            ? await new Promise((r) => {
                const chunks = [];
                req.on("data", (c) => chunks.push(c));
                req.on("end", () => r(Buffer.concat(chunks)));
              })
            : undefined;

        const request = new Request(url.href, {
          method: req.method,
          headers,
          body,
        });

        try {
          const response = await handler.fetch(request, {}, {});
          res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
          const arrayBuffer = await response.arrayBuffer();
          res.end(Buffer.from(arrayBuffer));
        } catch (err) {
          console.error("Server error:", err);
          res.writeHead(500);
          res.end("Internal Server Error");
        }
      });

      // Serve static client assets
      const staticDir = path.join(__dirname, "..", "dist", "client");
      const originalListener = server.listeners("request")[0];
      server.removeAllListeners("request");

      server.on("request", (req, res) => {
        const fs = require("fs");
        const filePath = path.join(staticDir, req.url.split("?")[0]);

        if (
          req.url.startsWith("/assets/") &&
          fs.existsSync(filePath) &&
          fs.statSync(filePath).isFile()
        ) {
          const ext = path.extname(filePath);
          const mimeTypes = {
            ".js": "application/javascript",
            ".css": "text/css",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".svg": "image/svg+xml",
            ".woff": "font/woff",
            ".woff2": "font/woff2",
          };
          res.writeHead(200, {
            "Content-Type": mimeTypes[ext] || "application/octet-stream",
            "Cache-Control": "public, max-age=31536000, immutable",
          });
          fs.createReadStream(filePath).pipe(res);
          return;
        }

        originalListener(req, res);
      });

      server.listen(SERVER_PORT, "127.0.0.1", () => {
        serverReady = true;
        resolve(SERVER_PORT);
      });
    });
  });
}

function createWindow(port) {
  const win = new BrowserWindow({
    width: 1366,
    height: 860,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    title: "Missio FAR — Centre sportif FAR",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  win.once("ready-to-show", () => {
    win.show();
  });

  if (isDev) {
    win.loadURL("http://localhost:5173");
  } else {
    win.loadURL(`http://127.0.0.1:${port}`);
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

app.whenReady().then(async () => {
  let port = 5173;
  if (!isDev) {
    port = await startProductionServer();
  }
  createWindow(port);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(port);
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
