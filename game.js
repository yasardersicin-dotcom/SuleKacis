import * as THREE from 'three';

let scene, camera, renderer, clock;
let player, enemy;
let keys = {};
let selectedChar = null;
let gameActive = false;
let score = 0;

// Hız ve Mekanik Ayarları
let baseSpeed = 20;
let currentSpeed = 20;
let enemyBaseSpeed = 13;
let currentEnemySpeed = 13;
let velY = 0;
const GRAV = 40;

let canDash = true;
let isDashing = false;
let isEnemyDashing = false; 
let dashCooldown = 2000;
let hasSpedUp = false; 

document.querySelectorAll('.charBtn').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.charBtn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedChar = btn.dataset.char;
    document.getElementById('startBtn').disabled = false;
    // Seçim hızlarını yine de ayarla
    baseSpeed = selectedChar === "cilek" ? 24 : 19;
  };
});

document.getElementById('startBtn').onclick = () => {
  if (!selectedChar) return;
  document.getElementById('menu').style.display = 'none';
  document.getElementById('ui').style.display = 'block';
  init();
  gameActive = true;
  animate();
};

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB); 

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 1.2));
  const sun = new THREE.DirectionalLight(0xffffff, 0.8);
  sun.position.set(10, 20, 10);
  scene.add(sun);

  // Zemin
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(2000, 2000),
    new THREE.MeshStandardMaterial({ color: 0x3a5f3a })
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // === KAÇAN KARAKTER (OYUNCU) - ddeed.jpg YAPILDI ===
  const playerGeo = new THREE.PlaneGeometry(5, 7); // Boyutu isteğine göre ayarlayabilirsin
  const playerMat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, transparent: true });
  player = new THREE.Mesh(playerGeo, playerMat);
  player.position.y = 3.5; // Zeminden yükseklik
  scene.add(player);

  new THREE.TextureLoader().load('imgs/ddeed.jpg', (t) => {
    player.material.map = t;
    player.material.needsUpdate = true;
  });

  // === KOVALAYAN KARAKTER (DÜŞMAN) ===
  const enemyGeo = new THREE.PlaneGeometry(6, 8);
  const enemyMat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, transparent: true });
  enemy = new THREE.Mesh(enemyGeo, enemyMat);
  enemy.position.set(50, 4, -50);
  scene.add(enemy);

  new THREE.TextureLoader().load('imgs/Ogi.jpeg', (t) => {
    enemy.material.map = t;
    enemy.material.needsUpdate = true;
  });

  window.addEventListener('keydown', e => keys[e.code] = true);
  window.addEventListener('keyup', e => keys[e.code] = false);
  clock = new THREE.Clock();
}

function performDash() {
  if (!canDash || isDashing) return;
  isDashing = true;
  isEnemyDashing = true; 
  canDash = false;
  
  const dashFill = document.getElementById('dashFill');
  if(dashFill) {
      dashFill.style.transition = 'none';
      dashFill.style.width = '0%';
      dashFill.style.backgroundColor = '#ff4444';
  }

  setTimeout(() => { isDashing = false; isEnemyDashing = false; }, 200);
  
  setTimeout(() => {
    canDash = true;
    if(dashFill) {
        dashFill.style.transition = 'width 1.5s linear';
        dashFill.style.width = '100%';
        dashFill.style.backgroundColor = '#44ff44';
    }
  }, dashCooldown);
}

function animate() {
  if (!gameActive) return;
  requestAnimationFrame(animate);
  const dt = clock.getDelta();

  score += dt;
  document.getElementById('t').innerText = score.toFixed(1);

  // 10 Saniye Sonra Ekstra Hızlanma
  if (score >= 10 && !hasSpedUp) {
    enemyBaseSpeed += 7; 
    hasSpedUp = true;
  }

  // Her 3 Saniyede Bir Hızlanma
  let periodicSpeedBoost = Math.floor(score / 3) * 1.5;
  currentSpeed = baseSpeed + (score * 0.2);
  currentEnemySpeed = enemyBaseSpeed + (score * 0.25) + periodicSpeedBoost;

  let moveX = 0;
  let moveZ = 0;
  let activeSpeed = isDashing ? currentSpeed * 4 : currentSpeed;
  let activeEnemySpeed = isEnemyDashing ? currentEnemySpeed * 2.5 : currentEnemySpeed;

  if (keys.KeyW) moveZ -= 1;
  if (keys.KeyS) moveZ += 1;
  if (keys.KeyA) moveX -= 1;
  if (keys.KeyD) moveX += 1;
  if (keys.KeyQ) performDash();

  if (moveX !== 0 || moveZ !== 0) {
    const direction = new THREE.Vector3(moveX, 0, moveZ).normalize();
    player.position.x += direction.x * activeSpeed * dt;
    player.position.z += direction.z * activeSpeed * dt;
    // Karakter resim olduğu için kameraya bakması daha iyi olur
    player.rotation.y = Math.atan2(direction.x, direction.z);
  }

  // Zıplama
  if (keys.Space && player.position.y <= 3.55) velY = 16;
  velY -= GRAV * dt;
  player.position.y += velY * dt;
  if (player.position.y < 3.5) { player.position.y = 3.5; velY = 0; }

  // Düşman Takibi
  const toPlayer = new THREE.Vector3().subVectors(player.position, enemy.position).normalize();
  enemy.position.x += toPlayer.x * activeEnemySpeed * dt;
  enemy.position.z += toPlayer.z * activeEnemySpeed * dt;
  enemy.lookAt(player.position.x, enemy.position.y, player.position.z);

  // Kamera
  camera.position.lerp(new THREE.Vector3(player.position.x, player.position.y + 12, player.position.z + 22), 0.1);
  camera.lookAt(player.position);

  if (player.position.distanceTo(enemy.position) < 3.5) gameOver();

  renderer.render(scene, camera);
}

function gameOver() {
  gameActive = false;
  document.getElementById('over').style.display = 'flex';
  document.getElementById('finalTime').innerText = score.toFixed(1);
}