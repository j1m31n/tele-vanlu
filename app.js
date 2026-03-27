let dataGlobal = {};
const MAX_USERS = 30;

/* SIMULACIÓN USUARIOS */
function getUsers() {
    return Math.floor(Math.random() * 35); // puede pasar 30
}

/* INICIO */
async function iniciarSistema() {

    const users = getUsers();

    if (users >= MAX_USERS) {
        alert("🚫 Sala llena, intenta más tarde");
        return;
    }

    document.getElementById("lock-screen").style.display = "none";
    document.getElementById("app").style.display = "block";

    await cargarDatos();
    renderCanales();
    actualizarUsuarios();

    setInterval(actualizarUsuarios, 20000);
}

/* JSON LOCAL */
async function cargarDatos() {
    const res = await fetch('./playlist.json');
    dataGlobal = await res.json();
}

/* BASE64 */
function decode(base64) {
    try { return atob(base64); }
    catch { return base64; }
}

/* NOMBRES PRO */
function getNombreCanal(nombre) {
    if (nombre === "canal1") return "🎬 CANAL 1 - ACCIÓN";
    if (nombre === "canal2") return "👻 CANAL 2 - TERROR";
    if (nombre === "canal3") return "🍥 CANAL 3 - ANIME";
    return nombre;
}

/* RENDER */
function renderCanales() {
    const cont = document.getElementById("canales");
    cont.innerHTML = "";

    Object.entries(dataGlobal).forEach(([nombre, lista]) => {

        const div = document.createElement("div");
        div.className = "canal";

        /* LIVE */
        const live = document.createElement("div");
        live.className = "live-badge";
        live.innerText = "● EN VIVO";
        div.appendChild(live);

        /* VIDEO PREVIEW (IMPORTANTE) */
        const video = document.createElement("video");
        video.muted = true;
        video.autoplay = true;
        video.playsInline = true;
        video.className = "preview";

        let i = 0;

        function playPreview() {
            video.src = decode(lista[i]);
            video.play().catch(()=>{});
        }

        video.onended = () => {
            i = (i + 1) % lista.length;
            playPreview();
        };

        playPreview();

        div.appendChild(video);

        /* INFO */
        const info = document.createElement("div");
        info.className = "canal-info";
        info.innerText = getNombreCanal(nombre);

        div.appendChild(info);

        div.onclick = () => abrirCanal(lista);

        cont.appendChild(div);
    });
}

/* PLAYER */
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
    const users = getUsers();
    document.getElementById("user-count").innerText = `${users}/${MAX_USERS}`;
}
