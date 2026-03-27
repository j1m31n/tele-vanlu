// CONFIGURACIÓN FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyCypKb1g8v7FXA56BfRl7y-jM4iIq-ioqI",
    authDomain: "control-de-usuarios-d081d.firebaseapp.com",
    databaseURL: "https://control-de-usuarios-d081d-default-rtdb.firebaseio.com",
    projectId: "control-de-usuarios-d081d",
    storageBucket: "control-de-usuarios-d081d-default-rtdb.appspot.com",
    messagingSenderId: "790041459039",
    appId: "1:790041459039:web:5e7744b4957ba2903f9eea"
};

// Inicializar
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();
const TOTAL_SLOTS = 30;
let userId = 'user_' + Math.floor(Math.random() * 1000000);

// 1. Monitor de Usuarios en Tiempo Real (Para la pantalla de inicio)
db.ref('usuarios').on('value', (snapshot) => {
    const conectados = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
    document.getElementById('user-count').innerText = `${conectados} / ${TOTAL_SLOTS} USUARIOS`;
});

async function iniciarSistema() {
    const boton = document.getElementById('btn-entrar');
    boton.innerText = "VERIFICANDO...";

    try {
        // Verificar cupo en Firebase
        const snapshotUsers = await db.ref('usuarios').once('value');
        const conectados = snapshotUsers.exists() ? Object.keys(snapshotUsers.val()).length : 0;

        if (conectados >= TOTAL_SLOTS) {
            alert("Sistema lleno. Por favor espera a que alguien se desconecte.");
            boton.innerText = "ENTRAR AL SISTEMA";
            return;
        }

        // Registrar mi conexión
        const myUserRef = db.ref('usuarios/' + userId);
        await myUserRef.set({ conectado: true, lastSeen: Date.now() });
        myUserRef.onDisconnect().remove();

        // Cargar Playlist desde GitHub
        const res = await fetch('https://raw.githubusercontent.com/j1m31n/tele-vanlu/main/playlist.json');
        const data = await res.json();

        // Cambiar Interfaz
        document.getElementById('lock-screen').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';

        cargarCanales(data);

    } catch (e) {
        console.error(e);
        alert("Error de conexión. Reintenta.");
        boton.innerText = "REINTENTAR";
    }
}

function cargarCanales(data) {
    const grid = document.getElementById('grid-canales');
    grid.innerHTML = '';

    Object.keys(data).forEach((nombreCanal, index) => {
        const videos = data[nombreCanal];
        const div = document.createElement('div');
        div.className = 'player-card';
        div.innerHTML = `
            <div class="canal-header">● EN VIVO: ${nombreCanal.toUpperCase()}</div>
            <video id="video-${index}" class="video-js vjs-16-9 vjs-default-skin" controls preload="auto" muted></video>
        `;
        grid.appendChild(div);

        // Inicializar Video.js para cada canal
        const player = videojs(`video-${index}`);
        let currentVideoIndex = 0;

        function reproducirSiguiente() {
            if (videos[currentVideoIndex]) {
                player.src({ type: 'video/mp4', src: videos[currentVideoIndex].url });
                player.play().catch(() => console.log("Auto-play bloqueado, requiere clic."));
                
                player.one('ended', () => {
                    currentVideoIndex = (currentVideoIndex + 1) % videos.length;
                    reproducirSiguiente();
                });
            }
        }

        reproducirSiguiente();
    });
}

window.iniciarSistema = iniciarSistema;
