let player;
let currentChannelData = null;

// Inicialización
function iniciarSistema() {
    document.getElementById('lock-screen').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    
    player = videojs('main-player', {
        fluid: true,
        autoplay: true,
        controls: true,
        preload: 'auto'
    });

    // Loop automático al terminar video
    player.on('ended', () => {
        if(currentChannelData) reproducirCanal(currentChannelData, document.getElementById('current-channel-name').innerText);
    });

    cargarCanales();
    initSimuladores();
}

// Carga con Cache-Busting (evita que el navegador guarde versiones viejas del JSON)
async function cargarCanales() {
    try {
        const timestamp = new Date().getTime();
        const response = await fetch(`playlist.json?v=${timestamp}`);
        const data = await response.json();
        const grid = document.getElementById('channels-grid');
        
        Object.keys(data).forEach(nombre => {
            const videos = data[nombre];
            const thumb = `${videos[0].thumb}?v=${timestamp}`;

            const card = document.createElement('div');
            card.className = 'channel-card';
            card.innerHTML = `
                <div class="live-badge">EN VIVO</div>
                <img src="${thumb}" alt="${nombre}">
                <div class="overlay"><div class="channel-title">${nombre}</div></div>
            `;
            
            card.onclick = () => cambiarCanalConFade(videos, nombre);
            grid.appendChild(card);
        });

        // Auto-play primer canal
        const first = Object.keys(data)[0];
        cambiarCanalConFade(data[first], first);

    } catch (e) { console.error("Error de carga", e); }
}

// Efecto Premium de cambio de canal
function cambiarCanalConFade(videos, nombre) {
    const wrapper = document.getElementById('player-wrapper');
    wrapper.classList.add('fade-out');
    
    setTimeout(() => {
        reproducirCanal(videos, nombre);
        wrapper.classList.remove('fade-out');
        wrapper.classList.add('fade-in');
    }, 500);
}

function reproducirCanal(videos, nombre) {
    currentChannelData = videos;
    const videoAzar = videos[Math.floor(Math.random() * videos.length)];
    document.getElementById('current-channel-name').innerText = nombre;
    
    player.src({ type: 'video/mp4', src: videoAzar.url });
    player.play();
}

// Simuladores Realistas
function initSimuladores() {
    // Contador bloqueado a max 30
    const userCount = document.getElementById('user-count');
    const headerCount = document.getElementById('live-users-header');
    
    setInterval(() => {
        const fakeUsers = Math.floor(Math.random() * (30 - 24) + 24);
        const text = `● ${fakeUsers} USUARIOS ONLINE`;
        if(userCount) userCount.innerText = text;
        headerCount.innerText = text;
    }, 5000);

    // Mensajes de bienvenida en chat
    setTimeout(() => agregarMensaje("Sistema", "Bienvenido al canal premium."), 1000);
}

function agregarMensaje(user, texto) {
    const box = document.getElementById('chat-messages');
    const msg = document.createElement('div');
    msg.innerHTML = `<b style="color:var(--gold)">${user}:</b> ${texto}`;
    msg.style.marginBottom = "8px";
    box.appendChild(msg);
    box.scrollTop = box.scrollHeight;
}

function enviarMensaje() {
    const input = document.getElementById('chat-input-field');
    if(input.value.trim() !== "") {
        agregarMensaje("Tú", input.value);
        input.value = "";
    }
}
