// CONFIGURACIÓN MAESTRA
const API_KEY = "mi_vaughn_tv_2026_unica"; // Cámbialo por algo secreto para tu contador
const MAX_USERS = 30;

async function iniciarSistema() {
    const statusLabel = document.getElementById('user-count');
    
    try {
        // 1. Verificar límite de usuarios (CountAPI)
        const res = await fetch(`https://api.countapi.xyz/hit/${API_KEY}/visitas`);
        const data = await res.json();
        
        if (data.value > MAX_USERS) {
            alert("⚠️ SALA LLENA. Límite de 30 personas alcanzado. Intenta en unos minutos.");
            // Restamos el hit que acabamos de hacer para no inflar el número
            fetch(`https://api.countapi.xyz/update/${API_KEY}/visitas?amount=-1`);
            return;
        }

        // 2. Mostrar la TV y ocultar la entrada
        document.getElementById('lock-screen').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';

        // 3. Cargar la Playlist y Sincronizar Canales
        const response = await fetch('playlist.json');
        const listas = await response.json();

        // Iniciamos los 3 canales
        configurarCanal('p1', listas.canal1);
        configurarCanal('p2', listas.canal2);
        configurarCanal('p3', listas.canal3);

    } catch (error) {
        console.error("Error al conectar con el servidor:", error);
        alert("Error de conexión. Reintenta.");
    }
}

function configurarCanal(id, videos) {
    const player = videojs(id);
    const ahora = Math.floor(Date.now() / 1000);
    
    // Suponemos una duración promedio de 1 hora (3600s) por video para el loop global
    const duracionVideo = 3600; 
    const tiempoTotalPlaylist = videos.length * duracionVideo;
    const tiempoGlobal = ahora % tiempoTotalPlaylist;
    
    const indiceVideo = Math.floor(tiempoGlobal / duracionVideo);
    const segundoExacto = tiempoGlobal % duracionVideo;

    // DESCIFRADO DE SEGURIDAD (Base64 a Link Real)
    const linkReal = atob(videos[indiceVideo]); 

    player.src({ type: 'video/mp4', src: linkReal });
    
    player.ready(() => {
        player.currentTime(segundoExacto);
        player.play().catch(e => console.log("Auto-play bloqueado, requiere clic."));
    });

    // Watchdog: Si el video falla o termina, re-sincroniza
    player.on('ended', () => location.reload());
    player.on('error', () => {
        setTimeout(() => { location.reload(); }, 3000);
    });
}

// Restar usuario al cerrar la pestaña para liberar cupo
window.addEventListener('beforeunload', () => {
    navigator.sendBeacon(`https://api.countapi.xyz/update/${API_KEY}/visitas?amount=-1`);
});
