const firebaseConfig = {
    apiKey: "AIzaSy...",
    authDomain: "control-de-usuarios-d081d.firebaseapp.com",
    databaseURL: "https://control-de-usuarios-d081d-default-rtdb.firebaseio.com",
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const TOTAL_SLOTS = 30;
let userId = 'user_' + Math.floor(Math.random() * 1000000);

// USERS
db.ref('usuarios').on('value', snap => {
    const count = snap.exists() ? Object.keys(snap.val()).length : 0;
    document.getElementById('user-count').innerText = `${count}/${TOTAL_SLOTS}`;
});

// ENTER
window.iniciarSistema = async function () {

    const btn = document.getElementById('btn-entrar');
    btn.innerText = "CARGANDO...";

    const snap = await db.ref('usuarios').once('value');
    const count = snap.exists() ? Object.keys(snap.val()).length : 0;

    if(count >= TOTAL_SLOTS){
        alert("Servidor lleno");
        btn.innerText = "ENTRAR";
        return;
    }

    const ref = db.ref('usuarios/' + userId);
    await ref.set(true);
    ref.onDisconnect().remove();

    document.getElementById('lock-screen').style.display = "none";
    document.getElementById('main-content').style.display = "block";

    const res = await fetch('https://raw.githubusercontent.com/j1m31n/tele-vanlu/main/playlist.json');
    const data = await res.json();

    cargarCanales(data);
};

// LOAD CHANNELS
function cargarCanales(data){

    const grid = document.getElementById('grid-canales');
    const loader = document.getElementById('loader');

    loader.style.display = "block";

    setTimeout(() => {

        loader.style.display = "none";

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
                autoplay: true,
                controls: true,
                fluid: true
            });

            let index = 0;
            const thumb = document.getElementById(`thumb-${i}`);

            function loop(){

                const vid = videos[index];

                if(vid.thumb){
                    thumb.style.backgroundImage = `url(${vid.thumb})`;
                    thumb.classList.remove('hidden');
                }

                player.src({type:'video/mp4', src: vid.url});
                player.play().catch(()=>{});

                player.one('playing', ()=>{
                    thumb.classList.add('hidden');
                });

                player.one('ended', ()=>{
                    index = (index+1)%videos.length;
                    loop();
                });
            }

            loop();

        });

    }, 800);
}
