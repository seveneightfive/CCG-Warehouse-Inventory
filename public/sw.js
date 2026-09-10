// Deliberately minimal: this app's data changes constantly, so we don't
// cache API responses or pages. This file exists mainly to satisfy
// "installable PWA" criteria so it can be added to a home screen.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // no-op: always go to the network
});
