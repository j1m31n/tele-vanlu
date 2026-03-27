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
        console.error("ERROR:", e);
        mostrarError("No se pudieron cargar los canales");
    }
}

/* CARGAR JSON LOCAL */
async function cargarDatos() {
    const res = await fetch('./playlist.json');

    if (!res.ok) {
        throw new Error("No se encontró playlist.json");
    }

    dataGlobal = await res.json();

    console.log("JSON OK:", dataGlobal);
}

/* ERROR EN PANTALLA */
function mostrarError(msg) {
    const cont = document.getElementById("canales");
    cont.innerHTML = `<p style="color:red; text-align:center;">${msg}</p>`;
}

/* BASE64 */
function decode(base64) {
    try {
        return atob(base64);
    } catch {
        return base64;
    }
}

/* RENDER */
function renderCanales() {
    const cont = document.getElementById("canales");
    cont.innerHTML = "";

    if (!dataGlobal || Object.keys(dataGlobal).length === 0) {
        mostrarError("No hay canales disponibles");
        return;
    }

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
    const count = Math.floor(Math.random() * 18) + 12;
    document.getElementById("user-count").innerText = `${count}/30`;
}
