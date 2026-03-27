// app.js completo y corregido

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getDatabase, ref, set, onValue, remove, push } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-database.js";

// --- CONFIGURACIÓN DE FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyCypKb1g8v7FXA56BfRl7y-jM4iIq-ioqI",
    authDomain: "control-de-usuarios-d081d.firebaseapp.com",
    databaseURL: "https://control-de-usuarios-d081d-default-rtdb.firebaseio.com",
    projectId: "control-de-usuarios-d081d",
    storageBucket: "control-de-usuarios-d081d.appspot.com",
    messagingSenderId: "790041459039",
    appId: "1:790041459039:web:5e7744b4957ba2903f9eea"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- CONFIGURACIÓN DE CANALES ---
const PLAYLIST_URL = 'https://raw.githubusercontent.com/j1m31n/tele-vanlu/main/playlist.json';
const MAX_USERS = 30;
let userKey = null;

// --- FUNCIONES PRINCIPALES ---
async function iniciarSistema() {
    const boton = document.getElementById('btn-entrar');
    boton.innerText = "CARGANDO...";

    try {
        // 1️⃣ Comprobar usuarios actuales
        const usuariosRef = ref(db, 'usuarios');
        onValue(usuariosRef, async (snapshot) => {
            const data = snapshot.val() || {};
            const count = Object.keys(data).length;
            document.getElementById('user-count').innerText = `${count}/${MAX_USERS}`;

            if (count >= MAX_USERS) {
                boton.innerText = "SISTEMA LLENO, ESPERA";
                boton.disabled = true;
                return;
            }
        });

        // 2️⃣ Registrar nuevo usuario
        const newUserRef = push(ref(db, 'usuarios'));
        set(newUserRef, { conectado: true });
        userKey = newUserRef.key;

        // 3️⃣ Ocultar pantalla de ingreso y mostrar TV
        document.getElementById('lock-screen').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';

        // 4️⃣ Cargar canales
        const response = await fetch(PLAYLIST_URL);
        if (!response.ok) throw new Error("No se pudo obtener la lista de canales");
        const data = await response.json();
        cargarCanales(data);

        // 5️⃣ Eliminar usuario al cerrar la pestaña
        window.addEventListener('beforeunload', () => {
            if (userKey) remove(ref(db, 'usuarios/' + userKey));
        });

    } catch (e) {
        console.error(e);
        alert("Error cargando canales o Firebase. Reintenta en unos segundos.");
        boton.innerText = "REINTENTAR ACCESO";
        boton.disabled = false;
    }
}

// --- CARGAR CANALES CON MINIATURAS DINÁMICAS ---
function cargarCanales(data) {
    const canalesDivs = document.querySelectorAll('.player-card');

    canalesDivs.forEach((div, index) => {
        const canalKey = `canal${index + 1}`;
        const urls = data[canalKey] || [];
        if (!urls.length) return;

        let videoIndex = 0;

        const videoEl = div.querySelector('video');
        const labelEl = div.querySelector('.label');

        // Función para cambiar video y miniatura al terminar
        function reproducirVideo() {
            const urlBase64 = urls[videoIndex];
            const url = atob(urlBase64); // decodifica la URL
            videoEl.src = url;
            videoEl.load();
            videoEl.play();

            // Actualizar miniatura estilo Vaughn
            div.style.backgroundImage = `url('https://img.youtube.com/vi/${extraerId(url)}/mqdefault.jpg')`;
            div.style.backgroundSize = "cover";
            div.style.backgroundPosition = "center";

            labelEl.innerHTML = `🔴 EN VIVO - ${canalKey.toUpperCase()}`;

            videoIndex = (videoIndex + 1) % urls.length;
        }

        // Reproducir primer video
        reproducirVideo();

        // Cambiar al siguiente video cuando termine
        videoEl.addEventListener('ended', reproducirVideo);
    });
}

// --- FUNCIONES AUXILIARES ---
function extraerId(url) {
    // Si tus videos son MP4 directos, no hay miniatura de YouTube, entonces puedes usar un placeholder
    return 'dQw4w9WgXcQ'; // placeholder
}

// --- EXPORTAR FUNCIÓN GLOBAL ---
window.iniciarSistema = iniciarSistema;
