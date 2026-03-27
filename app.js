// app.js - COMPLETO Y CORREGIDO PARA FIREBASE

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getDatabase, ref, onValue, set, get } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-database.js";

// CONFIGURACIÓN DE FIREBASE
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
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// URL de la lista de canales
const PLAYLIST_URL = 'https://raw.githubusercontent.com/j1m31n/tele-vanlu/main/playlist.json';
const TOTAL_SLOTS = 30;

// VARIABLES
let userId = null;

// FUNCION PRINCIPAL DE INICIO
async function iniciarSistema() {
    const boton = document.querySelector('.btn-acceso') || document.getElementById('btn-entrar');
    boton.innerText = "CARGANDO...";

    try {
        // Cargar lista de canales
        const response = await fetch(PLAYLIST_URL);
        if (!response.ok) throw new Error("No se pudo obtener la lista");
        const data = await response.json();

        // Verificar slots en Firebase
        userId = 'user_' + Math.floor(Math.random() * 1000000);
        const userRef = ref(db, `usuarios/${userId}`);

        // Leer cantidad actual de usuarios
        const usuariosRef = ref(db, 'usuarios');
        const snapshot = await get(usuariosRef);
        const usuariosActuales = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;

        if (usuariosActuales >= TOTAL_SLOTS) {
            alert("Lo sentimos, el sistema está completo (30 usuarios conectados). Intenta más tarde.");
            boton.innerText = "REINTENTAR";
            return;
        }

        // Registrar usuario en la base de datos
        await set(userRef, { conectado: true, timestamp: Date.now() });

        // Ocultar acceso y mostrar TV
        document.getElementById('lock-screen').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';

        // Cargar canales
        cargarCanales(data);
        actualizarEspectadoresRealtime();

        // Escuchar cambios en tiempo real
        onValue(usuariosRef, snapshot => {
            actualizarEspectadores(snapshot);
        });

        // Eliminar usuario al cerrar ventana
        window.addEventListener('beforeunload', async () => {
            await set(userRef, null);
        });

    } catch (e) {
        console.error(e);
        alert("Error al conectar con Firebase o cargar canales.");
        boton.innerText = "REINTENTAR";
    }
}

// FUNCION PARA CARGAR CANALES
function cargarCanales(canales) {
    const grid = document.getElementById('grid-canales');
    grid.innerHTML = '';

    let canalKeys = Object.keys(canales);
    canalKeys.forEach((key, index) => {
        const listaVideos = canales[key].map(v => atob(v)); // Decodifica URLs base64

        // Crear contenedor del canal
        const div = document.createElement('div');
        div.className = 'canal-card';
        div.innerHTML = `
            <div class="canal-header">● EN VIVO: CANAL ${index + 1}</div>
            <video id="video_${index}" class="video-js vjs-16-9 vjs-default-skin" controls preload="auto" muted autoplay></video>
            <div class="label">CANAL ${index + 1}</div>
        `;
        grid.appendChild(div);

        // Inicializar reproducción en bucle y cambiar miniatura
        let current = 0;
        const videoEl = div.querySelector('video');

        function playNext() {
            videoEl.src = listaVideos[current];
            videoEl.poster = listaVideos[current] + "?poster"; // se puede usar poster si tienes imágenes
            videoEl.play().catch(()=>{});
        }

        videoEl.addEventListener('ended', () => {
            current = (current + 1) % listaVideos.length;
            playNext();
        });

        playNext();
    });
}

// FUNCION PARA ACTUALIZAR ESPECTADORES
function actualizarEspectadores(snapshot) {
    const count = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
    const el = document.getElementById('user-count');
    if (el) el.innerText = `${count}/${TOTAL_SLOTS}`;
}

// FUNCION INICIAL PARA RELOJ DE ESPECTADORES
function actualizarEspectadoresRealtime() {
    const usuariosRef = ref(db, 'usuarios');
    onValue(usuariosRef, snapshot => {
        actualizarEspectadores(snapshot);
    });
}

window.iniciarSistema = iniciarSistema;
