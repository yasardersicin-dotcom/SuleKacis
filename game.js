import * as THREE from 'three';

let scene, camera, renderer, clock;
let player, enemy;
let keys = {};
let selectedChar = null;
let gameActive = false;
let score = 0;

// Karakter bilgileri
let playerImageUrl = '';
let enemyImageUrl = '';
let playerName = '';
let enemyName = '';

// Fizik
let baseSpeed = 22;
let currentSpeed = 22;
let enemyBaseSpeed = 15;
let currentEnemySpeed = 15;
let velY = 0;
const GRAV = 40;

// Dash
let canDash = true;
let isDashing = false;
let dashCooldown = 2500;

// Mobil kontroller
let joystickActive = false;
let joystickX = 0;
let joystickY = 0;
let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Karakter seçimi
document.querySelectorAll('.charBtn').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.charBtn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedChar = btn.dataset.char;
    document.getElementById('startBtn').disabled = false;

    if (selectedChar === "sule") {
      playerImageUrl = 'imgs/ddeed.jpg';
      enemyImageUrl = 'imgs/Ogi.jpeg';
      playerName = 'Şule';
      enemyName = 'Ogi';
    } else {
      playerImageUrl = 'imgs/Ogi.jpeg';
      enemyImageUrl = 'imgs/ddeed.jpg';
      playerName = 'Ogi';
      enemyName = 'Şule';
    }
  };
});

// Oyunu başlat
document.getElementById('startBtn').onclick = () => {
  if (!selectedChar) return;
  
  document.getElementById('menu').style.display = 'none';
  document.getElementById('ui').style.display = 'block';
  
  // Mobil kontrolleri sadece mobil cihazlarda göster
  if (isMobile) {
    document.getElementById('mobileControls').style.display = 'block';
  }
  
  document.getElementById('playerName').innerText = playerName;
  document.getElementById('enemyName').innerText = enemyName;
  
  // Mobil için landscape modunu teşvik et
  if (isMobile && screen.orientation && screen.orientation.lock) {
    screen.orientation.lock('landscape').catch(() => {
      // Orientation lock başarısız olursa devam et
    });
  }
  
  init();
  if (isMobile) {
    setupMobileControls();
  }
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

  // Oyuncu
  const playerGeo = new THREE.PlaneGeometry(5, 7);
  const playerMat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, transparent: true });
  player = new THREE.Mesh(playerGeo, playerMat);
  player.position.y = 3.5;
  scene.add(player);

  new THREE.TextureLoader().load(playerImageUrl, (texture) => {
    player.material.map = texture;
    player.material.needsUpdate = true;
  });

  // Düşman
  const enemyGeo = new THREE.PlaneGeometry(6, 8);
  const enemyMat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, transparent: true });
  enemy = new THREE.Mesh(enemyGeo, enemyMat);
  enemy.position.set(50, 4, -50);
  scene.add(enemy);

  new THREE.TextureLoader().load(enemyImageUrl, (texture) => {
    enemy.material.map = texture;
    enemy.material.needsUpdate = true;
  });

  window.addEventListener('keydown', e => keys[e.code] = true);
  window.addEventListener('keyup', e => keys[e.code] = false);
  window.addEventListener('resize', onWindowResize);
  
  clock = new THREE.Clock();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function setupMobileControls() {
  const joystickContainer = document.getElementById('joystickContainer');
  const joystickStick = document.getElementById('joystickStick');
  const jumpBtn = document.getElementById('jumpBtn');
  const dashBtn = document.getElementById('dashBtn');
  
  let joystickCenterX = 0;
  let joystickCenterY = 0;
  const maxDistance = 40;
  
  // Joystick touch events
  joystickContainer.addEventListener('touchstart', (e) => {
    e.preventDefault();
    joystickActive = true;
    const rect = joystickContainer.getBoundingClientRect();
    joystickCenterX = rect.left + rect.width / 2;
    joystickCenterY = rect.top + rect.height / 2;
  });
  
  joystickContainer.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!joystickActive) return;
    
    const touch = e.touches[0];
    let deltaX = touch.clientX - joystickCenterX;
    let deltaY = touch.clientY - joystickCenterY;
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (distance > maxDistance) {
      deltaX = (deltaX / distance) * maxDistance;
      deltaY = (deltaY / distance) * maxDistance;
    }
    
    joystickX = deltaX / maxDistance;
    joystickY = deltaY / maxDistance;
    
    joystickStick.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px))`;
  });
  
  const resetJoystick = () => {
    joystickActive = false;
    joystickX = 0;
    joystickY = 0;
    joystickStick.style.transform = 'translate(-50%, -50%)';
  };
  
  joystickContainer.addEventListener('touchend', resetJoystick);
  joystickContainer.addEventListener('touchcancel', resetJoystick);
  
  // Jump button
  jumpBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    keys.Space = true;
  });
  
  jumpBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    keys.Space = false;
  });
  
  // Dash button
  dashBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    performDash();
  });
}

function performDash() {
  if (!canDash || isDashing) return;
  isDashing = true;
  canDash = false;

  const dashFill = document.getElementById('dashFill');
  if (dashFill) {
    dashFill.style.transition = 'none';
    dashFill.style.width = '0%';
    dashFill.style.background = 'linear-gradient(90deg, #ff4444, #ff6b6b)';
  }

  setTimeout(() => isDashing = false, 250);

  setTimeout(() => {
    canDash = true;
    if (dashFill) {
      dashFill.style.transition = 'width 2s linear';
      dashFill.style.width = '100%';
      dashFill.style.background = 'linear-gradient(90deg, #4caf50, #8bc34a)';
    }
  }, dashCooldown);
}

function animate() {
  if (!gameActive) return;
  requestAnimationFrame(animate);
  const dt = clock.getDelta();

  score += dt;
  document.getElementById('t').innerText = score.toFixed(1);

  // Hızlanma
  let periodicSpeedBoost = Math.floor(score / 3) * 1.5;
  currentSpeed = baseSpeed + (score * 0.2);
  currentEnemySpeed = enemyBaseSpeed + (score * 0.25) + periodicSpeedBoost;

  let moveX = 0;
  let moveZ = 0;
  let activeSpeed = isDashing ? currentSpeed * 3.5 : currentSpeed;
  let activeEnemySpeed = currentEnemySpeed;

  // Klavye kontrolü
  if (keys.KeyW) moveZ -= 1;
  if (keys.KeyS) moveZ += 1;
  if (keys.KeyA) moveX -= 1;
  if (keys.KeyD) moveX += 1;
  if (keys.KeyQ) performDash();
  
  // Joystick kontrolü (mobil)
  if (joystickActive) {
    moveX += joystickX;
    moveZ += joystickY;
  }

  if (moveX !== 0 || moveZ !== 0) {
    const direction = new THREE.Vector3(moveX, 0, moveZ).normalize();
    player.position.x += direction.x * activeSpeed * dt;
    player.position.z += direction.z * activeSpeed * dt;
    player.lookAt(camera.position.x, player.position.y, camera.position.z);
  }

  // Zıplama
  if (keys.Space && player.position.y <= 3.55) {
    velY = 16;
    keys.Space = false;
  }
  velY -= GRAV * dt;
  player.position.y += velY * dt;
  if (player.position.y < 3.5) { 
    player.position.y = 3.5; 
    velY = 0; 
  }

  // Düşman Takibi
  const toPlayer = new THREE.Vector3().subVectors(player.position, enemy.position).normalize();
  enemy.position.x += toPlayer.x * activeEnemySpeed * dt;
  enemy.position.z += toPlayer.z * activeEnemySpeed * dt;
  enemy.lookAt(camera.position.x, enemy.position.y, camera.position.z);

  // Kamera
  camera.position.lerp(
    new THREE.Vector3(
      player.position.x, 
      player.position.y + 12, 
      player.position.z + 22
    ), 
    0.1
  );
  camera.lookAt(player.position);

  // Yakalanma kontrolü
  if (player.position.distanceTo(enemy.position) < 4.5) {
    gameOver();
  }

  renderer.render(scene, camera);
}

function gameOver() {
  gameActive = false;
  document.getElementById('over').style.display = 'flex';
  document.getElementById('finalTime').innerText = score.toFixed(1);
}
