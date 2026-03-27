// USA TU GITHUB PAGES (NO RAW)
const PLAYLIST_URL = 'https://j1m31n.github.io/tele-vanlu/playlist.json';

let dataGlobal = {};

/* INICIO */
async function iniciarSistema() {
    document.getElementById("lock-screen").style.display = "none";
    document.getElementById("app").style.display = "block";

    try {
        await cargarDatos();
        renderCanales();
        actualizarUsuarios();
        setInterval(actualizarUsuarios, 20000);
    } catch (e) {
        console.error(e);
        alert("Error cargando canales");
    }
}

/* CARGAR JSON */
async function cargarDatos() {
    const res = await fetch(PLAYLIST_URL);

    if (!res.ok) throw new Error("Error JSON");

    dataGlobal = await res.json();
    console.log("DATA:", dataGlobal);
}

/* DECODIFICAR */
function decode(base64) {
    try {
        return atob(base64);
    } catch {
        return base64;
    }
}

/* CREAR CANALES */
function renderCanales() {
    const cont = document.getElementById("canales");
    cont.innerHTML = "";

    Object.entries(dataGlobal).forEach(([nombre, lista]) => {

        const div = document.createElement("div");
        div.className = "canal";

        const video = document.createElement("video");
        video.src = decode(lista[0]);
        video.autoplay = true;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.className = "preview";

        div.appendChild(video);

        const info = document.createElement("div");
        info.className = "canal-info";
        info.innerText = nombre.toUpperCase();

        div.appendChild(info);

        div.onclick = () => abrirCanal(lista);

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
        player.play().catch(()=>{});
    }

    player.onended = () => {
        i = (i + 1) % lista.length;
        playNext();
    };

    playNext();

    modal.classList.remove("hidden");

    modal.onclick = (e) => {
        if (e.target.id === "modal") {
            modal.classList.add("hidden");
            player.pause();
        }
    };
}

/* CONTADOR */
function actualizarUsuarios() {
    const count = Math.floor(Math.random() * 18) + 12;
    document.getElementById("user-count").innerText = `${count}/30`;
}
