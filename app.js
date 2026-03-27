const PLAYLIST_URL = 'https://raw.githubusercontent.com/j1m31n/tele-vanlu/main/playlist.json';
const TOTAL_SLOTS = 30;

async function iniciarSistema() {
    const boton = document.querySelector('.btn-acceso');
    boton.innerText = "CARGANDO...";
    
    try {
        const response = await fetch(PLAYLIST_URL);
        if (!response.ok) throw new Error("No se pudo obtener la lista");
        const data = await response.json();
        
        // Ocultar acceso y mostrar la TV
        document.getElementById('acceso').style.display = 'none';
        document.getElementById('tv-container').style.display = 'block'; // Cambiado a block para que el grid interno funcione
        
        cargarCanales(data.canales);
        actualizarEspectadores();
        
        // Actualizar espectadores cada 30 segundos
        setInterval(actualizarEspectadores, 30000);
        
    } catch (e) {
        console.error(e);
        alert("Error de conexión con el servidor de canales. Reintenta en unos segundos.");
        boton.innerText = "REINTENTAR ACCESO";
    }
}

function cargarCanales(canales) {
    const grid = document.getElementById('grid-canales');
    grid.innerHTML = ''; // Limpiar antes de cargar
    
    canales.forEach(canal => {
        const div = document.createElement('div');
        div.className = 'canal-card';
        div.innerHTML = 
            <div class="canal-header"><span>●</span> EN VIVO: ${canal.nombre}</div>
            <div class="video-wrapper">
                <iframe src="${canal.url}" allow="autoplay; fullscreen" allowfullscreen></iframe>
            </div>
        ;
        grid.appendChild(div);
    });
}

function actualizarEspectadores() {
    const count = Math.floor(Math.random() * (28 - 12 + 1)) + 12; 
    const elTv = document.getElementById('user-count-tv');
    const elAcceso = document.getElementById('user-count');
    if(elTv) elTv.innerText = ${count}/${TOTAL_SLOTS};
    if(elAcceso) elAcceso.innerText = ${count}/${TOTAL_SLOTS};
}
