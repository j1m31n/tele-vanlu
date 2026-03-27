import { getDatabase, ref, onValue, set, remove, push } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-database.js";

// Conectar al db (ya importado en el script de Firebase)
const db = getDatabase();

// ID único para este usuario
let userId = null;

// Función que se ejecuta al entrar
async function iniciarSistema() {
    const boton = document.querySelector('.btn-acceso');
    boton.innerText = "CARGANDO...";

    try {
        const usuariosRef = ref(db, 'usuarios');
        let snapshot = await onValue(usuariosRef, () => {}); // Esto inicializa la escucha

        // Contar usuarios actuales
        onValue(usuariosRef, (snapshot) => {
            const data = snapshot.val() || {};
            const count = Object.keys(data).length;
            const el = document.getElementById('user-count');
            if (el) el.innerText = `${count}/30`;

            if(count >= 30){
                alert("⚠️ Límite de 30 usuarios alcanzado. Intenta más tarde.");
                boton.innerText = "REINTENTAR ACCESO";
            }
        }, {onlyOnce: true});

        // Chequear nuevamente antes de permitir acceso
        snapshot = await onValue(usuariosRef, () => {});
        const data = snapshot.val() || {};
        if(Object.keys(data).length >= 30){
            boton.innerText = "REINTENTAR ACCESO";
            return;
        }

        // Crear ID único para este usuario y guardarlo en DB
        userId = push(ref(db, 'usuarios')).key;
        set(ref(db, 'usuarios/' + userId), { conectado: true });

        // Eliminar usuario cuando cierre la página
        window.addEventListener('beforeunload', () => {
            if(userId) remove(ref(db, 'usuarios/' + userId));
        });

        // Ahora mostramos tu contenido de TV
        document.getElementById('lock-screen').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';

        // Llamar funciones de tu sistema de canales
        cargarCanales(/* tus canales */);
    } catch(e) {
        console.error(e);
        alert("Error de conexión con el servidor de usuarios. Reintenta en unos segundos.");
        boton.innerText = "REINTENTAR ACCESO";
    }
}
