const firebaseConfig = {
    apiKey: "AIzaSyCypKb1g8v7FXA56BfRl7y-jM4iIq-ioqI",
    authDomain: "control-de-usuarios-d081d.firebaseapp.com",
    databaseURL: "https://control-de-usuarios-d081d-default-rtdb.firebaseio.com",
    projectId: "control-de-usuarios-d081d",
    storageBucket: "control-de-usuarios-d081d.appspot.com",
    messagingSenderId: "790041459039",
    appId: "1:790041459039:web:5e7744b4957ba2903f9eea"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const TOTAL_SLOTS = 30;
let userId = 'user_' + Math.floor(Math.random() * 1000000);

// CONTADOR EN TIEMPO REAL
db.ref('usuarios').on('value', (snapshot) => {
    const conectados = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
    const el = document.getElementById('user-count');
    if (el) el.innerText = `${conectados} / ${TOTAL_SLOTS} USUARIOS CONECTADOS`;
});

// ENTRAR AL SISTEMA
window.iniciarSistema = async function () {
    const boton = document.getElementById('btn-entrar');
    boton.innerText = "ACCEDIENDO...";

    try {
        const snapshot = await db.ref('usuarios').once('value');
        const conectados = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;

        if (conectados >= TOTAL_SLOTS) {
            alert("Sistema lleno (30/30).");
            boton.innerText = "ENTRAR AL SISTEMA";
            return;
        }

        const myUserRef = db.ref('usuarios/' + userId);
        await myUserRef.set({ conectado: true, ts: Date.now() });
        myUserRef.onDisconnect().remove();

        // FETCH PLAYLIST (TU GITHUB)
        const res = await fetch('https://raw.githubusercontent.com/j1m31n/tele-vanlu/main/playlist.json');
        const data = await res.json();

        document.getElementById('lock-screen').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';

        setTimeout(() => cargarCanales(data), 100);

    } catch (e) {
        alert("Error al conectar. Verifica tu conexión.");
        boton.innerText = "REINTENTAR";
    }
};

// CARGAR CANALES
function cargarCanales(data) {
    const grid = document.getElementById('grid-canales');
    if (!grid) return;

    grid.innerHTML = '';

    Object.keys(data).forEach((nombre, i) => {
        const videos = data[nombre];

        const div = document.createElement('div');
        div.className = 'player-card';

        div.innerHTML = `
            <div class="canal-header">EN VIVO: ${nombre.toUpperCase()}</div>
            <div class="video-container">
                <div id="thumb-${i}" class="thumb-overlay"></div>
                <video id="vjs-${i}" class="video-js vjs-default-skin vjs-big-play-centered" controls preload="auto" muted></video>
            </div>
        `;

        grid.appendChild(div);

        const player = videojs(`vjs-${i}`, {
            fluid: true,
            autoplay: true,
            controls: true,
            controlBar: {
                downloadButton: false
            }
        });

        let videoIdx = 0;
        const thumbEl = document.getElementById(`thumb-${i}`);

        function playLoop() {
            const actual = videos[videoIdx];

            if (actual) {

                // MINIATURA
                if (actual.thumb && thumbEl) {
                    thumbEl.style.backgroundImage = `url(${actual.thumb})`;
                    thumbEl.classList.remove('hidden');
                }

                player.src({ type: 'video/mp4', src: actual.url });

                player.ready(() => {
                    player.play().catch(() => {});
                });

                player.one('playing', () => {
                    if (thumbEl) thumbEl.classList.add('hidden');
                });

                player.one('ended', () => {
                    videoIdx = (videoIdx + 1) % videos.length;
                    playLoop();
                });
            }
        }

        playLoop();
    });
}
