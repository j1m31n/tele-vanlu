const PLAYLIST_URL = 'https://raw.githubusercontent.com/j1m31n/tele-vanlu/main/playlist.json';

let dataGlobal = {};

async function iniciarSistema() {
    document.getElementById("lock-screen").style.display = "none";
    document.getElementById("app").style.display = "block";

    await cargarDatos();
    renderCanales();
    actualizarUsuarios();

    setInterval(actualizarUsuarios, 20000);
}

async function cargarDatos() {
    const res = await fetch(PLAYLIST_URL);
    dataGlobal = await res.json();
}

function decode(base64) {
    return atob(base64);
}

/* CREAR CANALES */
function renderCanales() {
    const cont = document.getElementById("canales");
    cont.innerHTML = "";

    Object.keys(dataGlobal).forEach((canal, index) => {
        const videos = dataGlobal[canal];

        const div = document.createElement("div");
        div.className = "canal";

        const video = document.createElement("video");
        video.src = decode(videos[0]);
        video.autoplay = true;
        video.muted = true;
        video.loop = true;
        video.className = "preview";

        div.appendChild(video);

        const info = document.createElement("div");
        info.className = "canal-info";
        info.innerText = canal.toUpperCase();

        div.appendChild(info);

        div.onclick = () => abrirCanal(videos);

        cont.appendChild(div);
    });
}

/* ABRIR CANAL */
function abrirCanal(lista) {
    const modal = document.getElementById("modal");
    const player = document.getElementById("player");

    let i = 0;

    function playNext() {
        player.src = decode(lista[i]);
        player.play();
    }

    player.onended = () => {
        i = (i + 1) % lista.length;
        playNext();
    };

    playNext();

    modal.classList.remove("hidden");

    modal.onclick = () => {
        modal.classList.add("hidden");
        player.pause();
    };
}

/* CONTADOR REALISTA */
function actualizarUsuarios() {
    const min = 12;
    const max = 30;
    const count = Math.floor(Math.random() * (max - min + 1)) + min;

    document.getElementById("user-count").innerText = `${count}/30`;
}
