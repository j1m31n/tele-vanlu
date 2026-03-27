// app.js completo
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

const PLAYLIST_URL = 'https://raw.githubusercontent.com/j1m31n/tele-vanlu/main/playlist.json';
const MAX_USERS = 30;
let userKey = null;

// --- FUNCIÓN PRINCIPAL ---
async function iniciarSistema() {
    const boton = document.getElementById('btn-entrar');
    boton.innerText = "CARGANDO...";

    try {
        const usuariosRef = ref(db, 'usuarios');

        // Escuchar cambios en usuarios
        onValue(usuariosRef, (snapshot) => {
            const data = snapshot.val() || {};
            const count = Object.keys(data).length;
            document.getElementById('user-count').innerText = `${count}/${MAX_USERS}`;
            if (count >= MAX_USERS) {
                boton.innerText = "SISTEMA LLENO, ESPERA";
                boton.disabled = true;
            }
        });

        // Registrar usuario
        const newUserRef = push(ref(db, 'usuarios'));
        set(newUserRef, { conectado: true });
        userKey = newUserRef.key;

        // Mostrar contenido
        document.getElementById('lock-screen').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';

        // Eliminar usuario al cerrar la pestaña
        window.addEventListener('beforeunload', () => {
            if (userKey) remove(ref(db, 'usuarios/' + userKey));
        });

        // Cargar canales
        const response = await fetch(PLAYLIST_URL);
        if (!response.ok) throw new Error("Error al cargar playlist");
        const data = await response.json();
        cargarCanales(data);

    } catch (e) {
        console.error(e);
        alert("Error al conectar con Firebase o cargar canales.");
        boton.innerText = "REINTENTAR ACCESO";
        boton.disabled = false;
    }
}

// --- CARGAR CANALES CON MINIATURAS ---
function cargarCanales(data) {
    const canalesDivs = document.querySelectorAll('.player-card');

    canalesDivs.forEach((div, index) => {
        const canalKey = `canal${index + 1}`;
        const urls = data[canalKey] || [];
        if (!urls.length) return;

        let videoIndex = 0;
        const videoEl = div.querySelector('video');
        const labelEl = div.querySelector('.label');

        function reproducirVideo() {
            const urlBase64 = urls[videoIndex];
            const url = atob(urlBase64); 
            videoEl.src = url;
            videoEl.load();
            videoEl.play();

            labelEl.innerHTML = `🔴 EN VIVO - ${canalKey.toUpperCase()}`;
            videoIndex = (videoIndex + 1) % urls.length;
        }

        reproducirVideo();
        videoEl.addEventListener('ended', reproducirVideo);
    });
}

// --- GLOBAL ---
window.iniciarSistema = iniciarSistema;
