let player;

// 1. Inicializar el sistema al hacer clic
function iniciarSistema() {
    document.getElementById('lock-screen').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    
    // Inicializar Video.js
    player = videojs('main-player', {
        fluid: true,
        autoplay: true,
        controls: true
    });

    cargarCanales();
    actualizarUsuarios();
}

// 2. Cargar canales desde tu playlist.json
async function cargarCanales() {
    try {
        const response = await fetch('playlist.json');
        const data = await response.json();
        const grid = document.getElementById('channels-grid');
        
        Object.keys(data).forEach(canalNombre => {
            const videos = data[canalNombre];
            const primerVideo = videos[0]; // Tomamos el primero para la miniatura

            const card = document.createElement('div');
            card.className = 'channel-card';
            card.innerHTML = `
                <div class="live-badge">EN VIVO</div>
                <img src="${primerVideo.thumb}" alt="${canalNombre}" style="width:100%">
                <div class="overlay">
                    <div class="channel-title">${canalNombre}</div>
                </div>
            `;
            
            // Al hacer clic, cambia el video principal
            card.onclick = () => reproducirCanal(videos, canalNombre);
            grid.appendChild(card);
        });

        // Reproducir el primer canal por defecto
        reproducirCanal(data[Object.keys(data)[0]], Object.keys(data)[0]);

    } catch (error) {
        console.error("Error cargando la playlist:", error);
    }
}

// 3. Lógica de reproducción
function reproducirCanal(listaVideos, nombre) {
    // Para que parezca "Live", elegimos un video al azar de la lista del canal
    const videoAzar = listaVideos[Math.floor(Math.random() * listaVideos.length)];
    
    player.src({ type: 'video/mp4', src: videoAzar.url });
    player.play();
    
    console.log(`Transmitiendo: ${nombre}`);
}

// 4. Simulador de usuarios (Para el toque "Premium")
function actualizarUsuarios() {
    const countEl = document.getElementById('user-count');
    setInterval(() => {
        const randomUsers = Math.floor(Math.random() * (1500 - 1200) + 1200);
        countEl.innerText = `👥 ${randomUsers.toLocaleString()} personas viendo ahora`;
    }, 3000);
}
