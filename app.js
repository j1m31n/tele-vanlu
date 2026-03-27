const firebaseConfig = {
    apiKey: "AIzaSyCypKb1g8v7FXA56BfRl7y-jM4iIq-ioqI",
    authDomain: "control-de-usuarios-d081d.firebaseapp.com",
    databaseURL: "https://control-de-usuarios-d081d-default-rtdb.firebaseio.com",
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const TOTAL_SLOTS = 30;
let userId = 'user_' + Math.floor(Math.random() * 1000000);

// CONTADOR
db.ref('usuarios').on('value', (snapshot) => {
    const conectados = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
    document.getElementById('user-count').innerText =
        `${conectados} / ${TOTAL_SLOTS} USUARIOS`;
});

// ENTRAR
window.iniciarSistema = async function() {

    const boton = document.getElementById('btn-entrar');
    boton.innerText = "ACCEDIENDO...";

    try {

        const snapshot = await db.ref('usuarios').once('value');
        const conectados = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;

        if (conectados >= TOTAL_SLOTS) {
            alert("Sistema lleno");
            boton.innerText = "ENTRAR";
            return;
        }

        const ref = db.ref('usuarios/' + userId);
        await ref.set(true);
        ref.onDisconnect().remove();

        document.getElementById('lock-screen').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';

        document.getElementById('loader').style.display = 'block';

        const res = await fetch('https://raw.githubusercontent.com/j1m31n/tele-vanlu/main/playlist.json');
        const data = await res.json();

        setTimeout(() => {
            document.getElementById('loader').style.display = 'none';
            cargarCanales(data);
        }, 500);

    } catch (e) {
        alert("Error al conectar");
        boton.innerText = "REINTENTAR";
    }
};

// CANALES
function cargarCanales(data) {

    const grid = document.getElementById('grid-canales');
    grid.innerHTML = '';

    Object.keys(data).forEach((nombre, i) => {

        const videos = data[nombre];

        const div = document.createElement('div');
        div.className = 'player-card';

        div.innerHTML = `
            <div class="canal-header">${nombre}</div>
            <div class="video-container">
                <div id="thumb-${i}" class="thumb-overlay"></div>
                <video id="vjs-${i}" class="video-js" muted></video>
            </div>
        `;

        grid.appendChild(div);

        const player = videojs(`vjs-${i}`, {
            fluid: true,
            autoplay: true,
            controls: true
        });

        let index = 0;
        const thumb = document.getElementById(`thumb-${i}`);

        function loop() {

            const vid = videos[index];

            if (vid.thumb) {
                thumb.style.backgroundImage = `url(${vid.thumb})`;
                thumb.classList.remove('hidden');
            }

            player.src({ type: 'video/mp4', src: vid.url });

            player.play().catch(()=>{});

            player.one('playing', () => {
                thumb.classList.add('hidden');
            });

            player.one('ended', () => {
                index = (index + 1) % videos.length;
                loop();
            });
        }

        loop();
    });
}
