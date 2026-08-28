#!/usr/bin/env node
/**
 * localhost:3100 was a leftover `next start` from an agent. That process is dead.
 * Tabs still have a service worker for that origin, so every click is cached
 * "WI-FI DROPPED". This process serves a kill-switch sw.js and a page that
 * unregisters workers, then sends the tab to the live Next server on :3000.
 * First paint leaves — do not wait for wipe or a founder click.
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PORT = 3100;
const LIVE = "http://localhost:3000";
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const swPath = path.join(root, "public/sw.js");
/** If public/sw.js is missing, still serve a worker that never intercepts documents. */
const SAFE_FALLBACK_SW = `"use strict";
self.addEventListener("install", function (event) { event.waitUntil(self.skipWaiting()); });
self.addEventListener("activate", function (event) { event.waitUntil(self.clients.claim()); });
`;

const PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Open Hood — moving to the live bay</title>
  <meta http-equiv="refresh" content="0;url=${LIVE}/">
  <script>
    (function () {
      var live = ${JSON.stringify(LIVE)};
      var u = new URL(location.href);
      var path = u.pathname + u.search + u.hash;
      if (u.pathname === "/offline" || u.pathname.indexOf("/offline/") === 0) path = "/";
      var dest = live + path;
      var left = false;
      function go() {
        if (left) return;
        left = true;
        location.replace(dest);
      }
      var jobs = [];
      if ("serviceWorker" in navigator) {
        jobs.push(navigator.serviceWorker.getRegistrations().then(function (regs) {
          return Promise.all(regs.map(function (reg) { return reg.unregister(); }));
        }));
      }
      if ("caches" in window) {
        jobs.push(caches.keys().then(function (keys) {
          return Promise.all(keys.map(function (k) { return caches.delete(k); }));
        }));
      }
      Promise.all(jobs).then(go, go);
      go();
    })();
  </script>
</head>
<body style="background:#0c1210;color:#e8efe9;font-family:ui-sans-serif,system-ui;padding:2rem">
  <p>Port 3100 is not the bay. Opening the live desk on port 3000…</p>
</body>
</html>`;

const server = http.createServer((req, res) => {
  const url = new URL(req.url || "/", `http://127.0.0.1:${PORT}`);
  if (url.pathname === "/sw.js") {
    let body = SAFE_FALLBACK_SW;
    try {
      body = fs.readFileSync(swPath, "utf8");
    } catch {
      /* keep fallback — never intercept documents */
    }
    res.writeHead(200, {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-store",
      "Service-Worker-Allowed": "/",
    });
    res.end(body);
    return;
  }
  res.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(PAGE);
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`rescue-3100 listening on http://127.0.0.1:${PORT} → ${LIVE}`);
});
