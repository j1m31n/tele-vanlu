// FIREBASE CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyCypKb1g8v7FXA56BfRl7y-jM4iIq-ioqI",
    databaseURL: "https://control-de-usuarios-d081d-default-rtdb.firebaseio.com"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let mainPlayer;
const TOTAL_SLOTS = 30;
let userId = 'user_' + Math.floor(Math.random()*1000000);

// CONTADOR DE USUARIOS
db.ref('usuarios').on('value', snapshot=>{
    const conectados = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
    const el = document.getElementById('user-count');
    if(el) el.innerText = `${conectados} / ${TOTAL_SLOTS} USUARIOS CONECTADOS`;
});

// INICIAR SISTEMA
window.iniciarSistema = async function(){
    const boton = document.querySelector('.login-box button');
    boton.innerText = "ACCEDIENDO...";

    try{
        // REVISAR USUARIOS
        const snapshot = await db.ref('usuarios').once('value');
        const conectados = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;

        if(conectados >= TOTAL_SLOTS){
            alert("Sistema lleno (30/30).");
            boton.innerText = "ENTRAR";
            return;
        }

        // AGREGAR USUARIO
        const myUserRef = db.ref('usuarios/' + userId);
        await myUserRef.set({ conectado:true, ts: Date.now() });
        myUserRef.onDisconnect().remove();

        // MOSTRAR APP
        document.getElementById('lock-screen').style.display='none';
        document.getElementById('app').style.display='block';

        // SKELETON
        const grid = document.getElementById('channels-grid');
        for(let i=0;i<6;i++){
            const sk = document.createElement('div');
            sk.className = 'skeleton';
            grid.appendChild(sk);
        }

        // CARGAR PLAYLIST CON CACHE BUSTING
        const res = await fetch('https://raw.githubusercontent.com/j1m31n/tele-vanlu/main/playlist.json?t=' + Date.now());
        const data = await res.json();
        grid.innerHTML='';

        initUI(data);

    }catch(e){
        alert("Error al conectar. Verifica tu conexión.");
        boton.innerText="REINTENTAR";
    }
}

// INIT UI
function initUI(data){
    const main = document.getElementById('main-player');
    const grid = document.getElementById('channels-grid');
    let first = true;

    Object.keys(data).forEach((name,i)=>{
        const videos = data[name];

        // MAIN PLAYER
        if(first){
            mainPlayer = videojs("main-player");
            playLoop(mainPlayer, videos);
            first=false;
        }

        // TARJETA CANAL
        const card = document.createElement('div');
        card.className='channel-card fade';
        card.innerHTML=`
            <div class="live-badge">EN VIVO</div>
            <video id="mini-${i}" class="video-js" muted autoplay loop playsinline></video>
            <div class="overlay">
                <div class="channel-title">${name}</div>
            </div>
        `;
        grid.appendChild(card);

        const miniPlayer = videojs(`mini-${i}`,{autoplay:true, muted:true, controls:false, loop:true});
        if(videos[0].thumb) miniPlayer.poster(videos[0].thumb);
        playLoop(miniPlayer, videos);

        // CLICK TARJETA → CAMBIO MAIN PLAYER CON FADE
        card.onclick = ()=>{
            main.style.opacity=0;
            setTimeout(()=>{
                mainPlayer.dispose();
                mainPlayer = videojs("main-player");
                playLoop(mainPlayer,videos);
                main.style.opacity=1;
            },300);
        }
    });
}

// LOOP VIDEOS
function playLoop(player,videos){
    let idx=0;
    function next(){
        player.src({type:'video/mp4',src:videos[idx].url});
        player.play().catch(()=>{});
        player.one('ended',()=>{
            idx=(idx+1)%videos.length;
            next();
        });
    }
    next();
}
