// CONFIGURACIÓN FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyCypKb1g8v7FXA56BfRl7y-jM4iIq-ioqI",
  authDomain: "control-de-usuarios-d081d.firebaseapp.com",
  databaseURL: "https://control-de-usuarios-d081d-default-rtdb.firebaseio.com",
  projectId: "control-de-usuarios-d081d",
  storageBucket: "control-de-usuarios-d081d.appspot.com",
  messagingSenderId: "790041459039",
  appId: "1:790041459039:web:5e7744b4957ba2903f9eea"
};

// Inicializar Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Configuración
const PLAYLIST_URL = 'https://raw.githubusercontent.com/j1m31n/tele-vanlu/main/playlist.json';
const TOTAL_SLOTS = 30;
let userId = null;

async function iniciarSistema() {
    const boton = document.getElementById('btn-entrar');
    boton.innerText = "CARGANDO...";

    try {
        const response = await fetch(PLAYLIST_URL);
        if (!response.ok) throw new Error("No se pudo obtener la lista");
        const data = await response.json();

        // Registrar usuario
        userId = 'user_' + Math.floor(Math.random() * 1000000);
        const userRef = db.ref('usuarios/' + userId);

        const snapshot = await db.ref('usuarios').once('value');
        const usuariosActuales = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;

        if (usuariosActuales >= TOTAL_SLOTS) {
            alert("Sistema completo (30 usuarios conectados). Intenta más tarde.");
            boton.innerText = "REINTENTAR";
            return;
        }

        await userRef.set({ conectado: true, timestamp: Date.now() });

        document.getElementById('lock-screen').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';

        cargarCanales(data);
        actualizarEspectadoresRealtime();

        window.addEventListener('beforeunload', () => {
            userRef.remove();
        });

    } catch (e) {
        console.error(e);
        alert("Error al conectar con Firebase o cargar canales.");
        boton.innerText = "REINTENTAR";
    }
}

function cargarCanales(canales) {
    const grid = document.getElementById('grid-canales');
    grid.innerHTML = '';

    let canalKeys = Object.keys(canales);
    canalKeys.forEach((key, index) => {
        const listaVideos = canales[key].map(v => atob(v));

        const div = document.createElement('div');
        div.className = 'canal-card';
        div.innerHTML = `
            <div class="canal-header">● EN VIVO: CANAL ${index + 1}</div>
            <video id="video_${index}" class="video-js vjs-16-9 vjs-default-skin" controls preload="auto" muted autoplay></video>
            <div class="label">CANAL ${index + 1}</div>
        `;
        grid.appendChild(div);

        let current = 0;
        const videoEl = div.querySelector('video');

        function playNext() {
            videoEl.src = listaVideos[current];
            videoEl.play().catch(()=>{});
        }

        videoEl.addEventListener('ended', () => {
            current = (current + 1) % listaVideos.length;
            playNext();
        });

        playNext();
    });
}

function actualizarEspectadores(snapshot) {
    const count = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
    const el = document.getElementById('user-count');
    if(el) el.innerText = `${count}/${TOTAL_SLOTS}`;
}

function actualizarEspectadoresRealtime() {
    db.ref('usuarios').on('value', snapshot => {
        actualizarEspectadores(snapshot);
    });
}

window.iniciarSistema = iniciarSistema;
