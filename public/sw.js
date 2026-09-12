const SHELL_CACHE = "ccg-shell-v1";
const SHELL_URLS = ["/", "/board", "/dashboard", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then((c) => c.addAll(SHELL_URLS)));
  self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return; // never intercept writes
  if (request.url.includes("/api/")) return; // let Dexie/network handle data
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});