const CACHE_NAME = "jsondeck-static-v1";
const OFFLINE_URLS = ["/", "/editor"];

self.importScripts("https://cdn.jsdelivr.net/npm/axios@1.7.7/dist/axios.min.js");

const axiosRequest = async (request) => {
  const response = await self.axios.request({
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    responseType: "arraybuffer",
    validateStatus: () => true,
  });

  return new Response(response.data, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
};

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  if (request.mode === "navigate") {
    event.respondWith(
      axiosRequest(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match("/editor"))
        )
    );
    return;
  }

  if (request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(request).then((cached) => cached || axiosRequest(request))
    );
  }
});
