let player = document.getElementById('player');
let gameContainer = document.getElementById('game-container');
let scoreDisplay = document.getElementById('score');
let livesDisplay = document.getElementById('lives');
let score = 0;
let lives = 3; // 初期のライフを2に設定
let playerSpeed = 50;
let initialEnemySpeed = 0.003; // 初期の敵の速さ
let enemySpeed = initialEnemySpeed;
let initialEnemyInterval = 2000; // 初期の敵の出現間隔
let enemyInterval = initialEnemyInterval;
let isGameOver = false;
let hitSound = new Audio('ding2.ogg');  // サウンドファイルの読み込み
let bgm = new Audio('bgm.mp3');  // BGMファイルの読み込み
let keys = {};
let bgmStarted = false;  // BGMが再生されたかどうかを追跡するフラグ

// BGMをループさせる設定
bgm.loop = true;

function createTomato() {
    let tomato = document.createElement('div');
    tomato.className = 'tomato';
    tomato.style.left = `${player.offsetLeft - player.offsetWidth / 4}px`; // 中央から発射
    tomato.style.top = `${player.offsetTop - player.offsetHeight * 0.4}px`;
    gameContainer.appendChild(tomato);
    moveTomato(tomato);
}

function moveTomato(tomato) {
    let interval = setInterval(() => {
        if (isGameOver) {
            tomato.remove();
            clearInterval(interval);
            return;
        }
        let tomatoTop = parseInt(tomato.style.top);
        if (tomatoTop <= 0) {
            tomato.remove();
            clearInterval(interval);
        } else {
            tomato.style.top = `${tomatoTop - gameContainer.offsetHeight * 0.01}px`;
            checkTomatoCollision(tomato, interval);
        }
    }, 20);
}

function createEnemy() {
    let enemy = document.createElement('div');
    enemy.className = 'enemy';
    
    // ランダムに敵キャラの画像を選択
    const enemyImages = ['enemy1.png', 'enemy2.png', 'enemy3.png'];
    const randomImage = enemyImages[Math.floor(Math.random() * enemyImages.length)];
    enemy.style.backgroundImage = `url('${randomImage}')`;
    
    enemy.style.left = `${Math.random() * (gameContainer.offsetWidth - gameContainer.offsetWidth * 0.1)}px`;
    enemy.style.top = `0px`;
    
    // 敵の種類に応じて速度を変更
    if (randomImage === 'enemy2.png') {
        enemy.dataset.speed = enemySpeed * 1.5; // 速い敵
    } else if (randomImage === 'enemy3.png') {
        enemy.dataset.speed = enemySpeed * 0.75; // 遅い敵
    } else {
        enemy.dataset.speed = enemySpeed;
    }

    gameContainer.appendChild(enemy);
    moveEnemy(enemy);
}

function moveEnemy(enemy) {
    let interval = setInterval(() => {
        if (isGameOver) {
            enemy.remove();
            clearInterval(interval);
            return;
        }
        let enemyTop = parseInt(enemy.style.top);
        if (enemyTop >= gameContainer.offsetHeight) {
            enemy.remove();
            clearInterval(interval);
        } else {
            enemy.style.top = `${enemyTop + gameContainer.offsetHeight * enemy.dataset.speed}px`;
            checkCollision(enemy);
        }
    }, 20);
}

function checkCollision(enemy) {
    let playerRect = player.getBoundingClientRect();
    let enemyRect = enemy.getBoundingClientRect();

    if (
        playerRect.x < enemyRect.x + enemyRect.width &&
        playerRect.x + playerRect.width > enemyRect.x &&
        playerRect.y < enemyRect.y + enemyRect.height &&
        playerRect.y + playerRect.height > enemyRect.y
    ) {
        hitPlayer();
        enemy.remove();
    }
}

function hitPlayer() {
    lives--;
    updateLives();
    player.classList.add('player-hit');
    setTimeout(() => {
        player.classList.remove('player-hit');
    }, 2500);  // 0.5sの点滅を5回行うため、2.5秒後にクラスを削除

    if (lives <= 0) {
        gameOver();
    }
}

function checkTomatoCollision(tomato, tomatoInterval) {
    let tomatoRect = tomato.getBoundingClientRect();
    let enemies = document.querySelectorAll('.enemy');
    enemies.forEach(enemy => {
        let enemyRect = enemy.getBoundingClientRect();
        if (
            tomatoRect.x < enemyRect.x + enemyRect.width &&
            tomatoRect.x + tomatoRect.width > enemyRect.x &&
            tomatoRect.y < enemyRect.y + enemyRect.height &&
            tomatoRect.y + tomatoRect.height > enemyRect.y
        ) {
            hitSound.play();  // サウンドを再生
            enemy.remove();
            clearInterval(tomatoInterval);
            // トマトが潰れるアニメーションを適用
            tomato.classList.add('squash');
            setTimeout(() => tomato.remove(), 300); // アニメーション後にトマトを削除
            updateScore(10); // 10ポイント加算
        }
    });
}

function gameOver() {
    isGameOver = true;
    bgm.pause();  // ゲームオーバー時にBGMを停止
    Swal.fire({
        title: 'Game Over',
        text: `Your final score is ${score}`,
        icon: 'error',
        confirmButtonText: 'Replay'
    }).then((result) => {
        if (result.isConfirmed) {
            resetGame();
        }
    });
}

function movePlayer() {
    if (isGameOver) return;

    let playerLeft = parseInt(window.getComputedStyle(player).left);

    if (keys['ArrowLeft'] && playerLeft > 0) {
        player.style.left = `${playerLeft - playerSpeed}px`;
    }

    if (keys['ArrowRight'] && playerLeft < (gameContainer.offsetWidth - player.offsetWidth)) {
        player.style.left = `${playerLeft + playerSpeed}px`;
    }
}

document.addEventListener('keydown', (event) => {
    keys[event.key] = true;
    
    // ユーザーが最初にキーを押したときにBGMを再生
    if (!bgmStarted) {
        bgm.play();
        bgmStarted = true;
    }

    if (event.code === 'Space') {
        createTomato();
    }
});

document.addEventListener('keyup', (event) => {
    keys[event.key] = false;
});

function updateScore(points) {
    score += points;
    scoreDisplay.textContent = `Score: ${score}`;
}

function updateLives() {
    livesDisplay.innerHTML = '';
    for (let i = 0; i < lives; i++) {
        const life = document.createElement('span');
        life.className = 'life';
        life.textContent = '❤️';
        livesDisplay.appendChild(life);
    }
}

function resetGame() {
    // ゲームの状態をリセット
    score = 0;
    lives = 2; // 初期のライフを2に設定
    isGameOver = false;
    enemySpeed = initialEnemySpeed; // 敵の速さをリセット
    enemyInterval = initialEnemyInterval; // 敵の出現間隔をリセット
    updateScore(0);
    updateLives();
    
    // 既存の敵を削除
    const enemies = document.querySelectorAll('.enemy');
    enemies.forEach(enemy => enemy.remove());
    
    // ゲーム再開
    bgm.play();
    bgmStarted = true;

    clearInterval(enemyCreationInterval); // 既存の敵生成インターバルをクリア
    enemyCreationInterval = setInterval(createEnemy, enemyInterval); // 新しいインターバルを設定
}

function increaseDifficulty() {
    if (!isGameOver) {
        enemySpeed += 0.001; // 一定時間ごとに敵の速さを増加
    }
}

function decreaseEnemyInterval() {
    if (enemyInterval > 500 && !isGameOver) { // 最低でも500ms間隔を維持
        enemyInterval -= 100;
        clearInterval(enemyCreationInterval);
        enemyCreationInterval = setInterval(createEnemy, enemyInterval);
    }
}

let enemyCreationInterval = setInterval(createEnemy, enemyInterval);
setInterval(increaseDifficulty, 10000); // 10秒ごとに難易度を上げる
setInterval(decreaseEnemyInterval, 10000); // 10秒ごとに出現間隔を短縮

setInterval(movePlayer, 20);

// 初期ライフを設定
updateLives();

// ゲーム開始時のポップアップ
Swal.fire({
    title: 'Welcome!',
    text: 'Press Start to begin the game',
    icon: 'info',
    confirmButtonText: 'Start'
}).then((result) => {
    if (result.isConfirmed) {
        // ゲームを開始する
        bgm.play();
        bgmStarted = true;
    }
});
