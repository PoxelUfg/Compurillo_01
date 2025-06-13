const CACHE_NAME = "Videojuego-compurillo";

self.addEventListener('install', event =>{
    event.waitUntil((async() =>{
        const cache = await caches.open(CACHE_NAME);
        cache.addAll([
            './',
            './index.html',
            './lobby.html',
            './game.html',
            './vote.html',
            './results.html',
            './js/game.js',
            './js/lobby.js',
            './js/results.js',
            './js/script.js',
            './js/vote.js',
            './CSS/style.css'
        ]);
    })()

    )
});


self.addEventListener('fetch',(event)=>{
    event.respondWith(
        (new Promise(
            (resolve,reject) =>{
                    fetch(event.request).then(resolve).catch(reject);
                }
            )   
        ).catch(()=>{} )
    )
});