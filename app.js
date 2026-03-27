const firebaseConfig = {
    apiKey: "AIzaSyCypKb1g8v7FXA56BfRl7y-jM4iIq-ioqI",
    databaseURL: "https://control-de-usuarios-d081d-default-rtdb.firebaseio.com"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let mainPlayer;

// LOGIN + CONTROL USUARIOS
window.iniciarSistema = async function(){

    const res = await fetch('https://raw.githubusercontent.com/j1m31n/tele-vanlu/main/playlist.json');
    const data = await res.json();

    document.getElementById('lock-screen').style.display = 'none';
    document.getElementById('app').style.display = 'flex';

    initUI(data);
};

// INIT UI
function initUI(data){

    const mainContainer = document.getElementById('main-player');
    const channels = document.getElementById('channels');

    let first = true;

    Object.keys(data).forEach((name, i)=>{

        const videos = data[name];

        // MAIN PLAYER
        if(first){
            mainContainer.innerHTML = `<video id="main-video" class="video-js" controls autoplay></video>`;
            mainPlayer = videojs("main-video");
            playLoop(mainPlayer, videos);
            first = false;
        }

        // CARD
        const card = document.createElement('div');
        card.className = 'channel-card';

        card.innerHTML = `
            <video id="preview-${i}" class="video-js" muted></video>
            <div class="channel-title">${name}</div>
        `;

        channels.appendChild(card);

        const preview = videojs(`preview-${i}`, {
            autoplay: true,
            muted: true,
            controls: false
        });

        playLoop(preview, videos);

        card.onclick = ()=>{
            mainPlayer.dispose();
            mainContainer.innerHTML = `<video id="main-video" class="video-js" controls autoplay></video>`;
            mainPlayer = videojs("main-video");
            playLoop(mainPlayer, videos);
        };

    });
}

// LOOP
function playLoop(player, videos){

    let i = 0;

    function next(){
        player.src({type:'video/mp4', src: videos[i].url});
        player.play().catch(()=>{});

        player.one('ended', ()=>{
            i = (i+1)%videos.length;
            next();
        });
    }

    next();
}
