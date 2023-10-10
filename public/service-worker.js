const cachev1 = "cache-3.0"
const assets = [
  "/",
  "../../assetsDashboard/images/fauna/"
]

self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(cachev1).then(cache => {
      cache.addAll(assets)
    })
  )
})

self.addEventListener('fetch', function(event) {
  console.log('used to intercept requests so we can check for the file or data in the cache')
})

self.addEventListener('activate', function(event) {
  console.log('this event triggers when the service worker activates')
})
