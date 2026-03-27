const PLAYLIST_URL = './playlist.json';
const TOTAL_SLOTS = 30;

async function iniciarSistema() {
    try {
        const response = await fetch(PLAYLIST_URL);
        if (!response.ok) throw new Error();
        const data = await response.json();
        
        document.getElementById('acceso').style.display = 'none';
        document.getElementById('tv-container').style.display = 'grid';
        
        cargarCanales(data.canales);
        actualizarEspectadores();
    } catch (e) {
        alert("Error de conexión. Reintenta.");
    }
}

function cargarCanales(canales) {
    const grid = document.getElementById('grid-canales');
    grid.innerHTML = '';
    canales.forEach(canal => {
        const div = document.createElement('div');
        div.className = 'canal-card';
        div.innerHTML = 
            <h3>${canal.nombre}</h3>
            <iframe src="${canal.url}" allow="autoplay" allowfullscreen></iframe>
        ;
        grid.appendChild(div);
    });
}

function actualizarEspectadores() {
    const count = Math.floor(Math.random() * 5) + 1; 
    document.getElementById('user-count').innerText = ${count}/${TOTAL_SLOTS};
}
