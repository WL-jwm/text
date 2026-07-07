// 河北地下水基础资料数据库 - Service Worker v3.18.0
// 策略: App Shell预缓存 + Stale-While-Revalidate + Network First导航

const CACHE_VERSION = 'gwdb-v3.18.0';
const STATIC_CACHE = CACHE_VERSION + '-static';
const DYNAMIC_CACHE = CACHE_VERSION + '-dynamic';
const PRECACHE_MANIFEST_URL = './precache-manifest.json';

// 安装事件：加载预缓存清单并缓存所有资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      // 先缓存App Shell核心文件
      return cache.addAll([
        './',
        './index.html',
        './manifest.json',
      ]).then(() => {
        // 尝试加载构建产物预缓存清单
        return fetch(PRECACHE_MANIFEST_URL)
          .then(resp => resp.json())
          .then(manifest => {
            const urls = manifest.map(item => item.url);
            // 分批缓存，避免一次性请求过多
            const batchSize = 10;
            const batches = [];
            for (let i = 0; i < urls.length; i += batchSize) {
              batches.push(urls.slice(i, i + batchSize));
            }
            return batches.reduce((promise, batch) => {
              return promise.then(() =>
                Promise.allSettled(
                  batch.map(url =>
                    cache.add(url).catch(() => {/* 跳过失败项 */})
                  )
                )
              );
            }, Promise.resolve());
          })
          .catch(() => {
            // 无预缓存清单时仅缓存核心文件
            console.log('No precache manifest found, using core only');
          });
      });
    })
  );
  self.skipWaiting();
});

// 激活事件：清理旧版本缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(name => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// 请求拦截策略
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 仅处理同源请求
  if (url.origin !== self.location.origin) {
    return;
  }

  // 导航请求：Network First，回退缓存
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // 静态资源（JS/CSS/HTML/JSON/SVG/PNG/ICO/字体）：Stale While Revalidate
  if (isStaticAsset(url.pathname)) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          const fetchPromise = fetch(request)
            .then(response => {
              if (response.ok) cache.put(request, response.clone());
              return response;
            })
            .catch(() => cached);
          return cached || fetchPromise;
        })
      )
    );
    return;
  }
});

function isStaticAsset(pathname) {
  return /\.(js|css|html|json|svg|png|ico|woff2?|ttf|eot|map)$/i.test(pathname);
}

// 消息处理
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data?.type === 'CLEAR_CACHE') {
    caches.delete(DYNAMIC_CACHE);
  }
  if (event.data?.type === 'GET_CACHE_INFO') {
    Promise.all([
      caches.open(STATIC_CACHE).then(c => c.keys()),
      caches.open(DYNAMIC_CACHE).then(c => c.keys()),
    ]).then(([staticKeys, dynamicKeys]) => {
      self.clients.matchAll().then(clients =>
        clients.forEach(c => c.postMessage({
          type: 'CACHE_INFO',
          staticCount: staticKeys.length,
          dynamicCount: dynamicKeys.length,
          version: CACHE_VERSION,
        }))
      );
    });
  }
});
