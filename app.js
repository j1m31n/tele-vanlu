const firebaseConfig = {
    apiKey: "AIzaSyCypKb1g8v7FXA56BfRl7y-jM4iIq-ioqI",
    databaseURL: "https://control-de-usuarios-d081d-default-rtdb.firebaseio.com"
};

firebase.initializeApp(firebaseConfig);

let mainPlayer;

// LOGIN
window.iniciarSistema = async function(){

    document.getElementById('lock-screen').style.display = 'none';
    document.getElementById('app').style.display = 'block';

    const res = await fetch('https://raw.githubusercontent.com/j1m31n/tele-vanlu/main/playlist.json');
    const data = await res.json();

    initUI(data);
};

// INIT
function initUI(data){

    const main = document.getElementById('main-player');
    const grid = document.getElementById('channels-grid');

    let first = true;

    Object.keys(data).forEach((name, i)=>{

        const videos = data[name];

        // PLAYER PRINCIPAL
        if(first){
            main.innerHTML = `<video id="main-video" class="video-js" controls autoplay></video>`;
            mainPlayer = videojs("main-video");
            playLoop(mainPlayer, videos);
            first = false;
        }

        // CARD
        const card = document.createElement('div');
        card.className = 'channel-card';

        card.innerHTML = `
            <div class="video-wrapper">
                <video id="prev-${i}" class="video-js" muted></video>
            </div>
            <div class="channel-title">${name}</div>
        `;

        grid.appendChild(card);

        const preview = videojs(`prev-${i}`, {
            autoplay: true,
            muted: true,
            controls: false
        });

        playLoop(preview, videos);

        // CAMBIAR CANAL
        card.onclick = ()=>{
            mainPlayer.dispose();
            main.innerHTML = `<video id="main-video" class="video-js" controls autoplay></video>`;
            mainPlayer = videojs("main-video");
            playLoop(mainPlayer, videos);
        };

    });
}

// LOOP (NO SE TOCA)
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
