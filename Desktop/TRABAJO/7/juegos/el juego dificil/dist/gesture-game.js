// El Juego Más Difícil del Mundo - TypeScript Compiled Version

// Gesture Recognition System
class GestureController {
    constructor() {
        this.hands = null;
        this.camera = null;
        this.videoElement = null;
        this.isActive = false;
        this.currentGesture = null;
        this.gestureCallbacks = {};
        this.fingerThreshold = 0.8;
        this.gestureStabilityFrames = 2;
        this.gestureHistory = [];
        this.currentPointingVector = null;
    }

    async initialize() {
        try {
            this.videoElement = document.getElementById('videoElement');
            if (!window.Hands) {
                console.warn('MediaPipe Hands not available');
                return false;
            }
            
            this.hands = new window.Hands({
                locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
            });

            this.hands.setOptions({
                maxNumHands: 1,
                modelComplexity: 1,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            this.hands.onResults(this.onResults.bind(this));

            if (!window.Camera) {
                console.warn('MediaPipe Camera not available');
                return false;
            }

            this.camera = new window.Camera(this.videoElement, {
                onFrame: async () => {
                    if (this.isActive) {
                        await this.hands.send({ image: this.videoElement });
                    }
                },
                width: 640,
                height: 480
            });

            return true;
        } catch (error) {
            console.error('Error initializing gesture controller:', error);
            return false;
        }
    }

    async start() {
        try {
            if (this.camera) {
                await this.camera.start();
                this.isActive = true;
                const cameraContainer = document.getElementById('cameraContainer');
                if (cameraContainer) {
                    cameraContainer.style.display = 'block';
                }
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error starting camera:', error);
            return false;
        }
    }

    stop() {
        if (this.camera) {
            this.camera.stop();
            this.isActive = false;
            const cameraContainer = document.getElementById('cameraContainer');
            if (cameraContainer) {
                cameraContainer.style.display = 'none';
            }
        }
    }

    onResults(results) {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            const gesture = this.recognizeGesture(landmarks);
            const indexTip = landmarks[8];
            const wrist = landmarks[0];
            this.currentPointingVector = this.calculatePointingVector(indexTip, wrist);

            this.gestureHistory.push(gesture);
            if (this.gestureHistory.length > this.gestureStabilityFrames) {
                this.gestureHistory.shift();
            }

            const stableGesture = this.getStableGesture();
            if (stableGesture !== this.currentGesture) {
                this.currentGesture = stableGesture;
                this.triggerGestureCallback(stableGesture);
            }
        } else {
            this.gestureHistory = [];
            this.currentPointingVector = null;
            if (this.currentGesture !== null) {
                this.currentGesture = null;
                this.triggerGestureCallback(null);
            }
        }
    }

    recognizeGesture(landmarks) {
        const wrist = landmarks[0];
        const indexTip = landmarks[8];
        const indexPip = landmarks[6];
        const middleTip = landmarks[12];
        const middlePip = landmarks[10];
        const ringTip = landmarks[16];
        const ringPip = landmarks[14];
        const pinkyTip = landmarks[20];
        const pinkyPip = landmarks[18];
        const thumbTip = landmarks[4];
        const thumbIp = landmarks[3];

        const indexExtended = indexTip.y < indexPip.y - 0.015;
        const middleExtended = middleTip.y < middlePip.y - 0.015;
        const ringExtended = ringTip.y < ringPip.y - 0.015;
        const pinkyExtended = pinkyTip.y < pinkyPip.y - 0.015;
        const thumbExtended = Math.abs(thumbTip.x - thumbIp.x) > 0.015;

        const extendedCount = [thumbExtended, indexExtended, middleExtended, ringExtended, pinkyExtended].filter(Boolean).length;

        if (extendedCount >= 4) {
            return 'open_hand';
        }

        if (indexExtended && extendedCount <= 2) {
            return this.getPointingDirection(indexTip, wrist);
        }

        return null;
    }

    getPointingDirection(fingerTip, wrist) {
        const deltaX = -(fingerTip.x - wrist.x);
        const deltaY = fingerTip.y - wrist.y;
        const minThreshold = 0.01;

        if (Math.abs(deltaX) > minThreshold || Math.abs(deltaY) > minThreshold) {
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                return deltaX > 0 ? 'right' : 'left';
            } else {
                return deltaY < 0 ? 'up' : 'down';
            }
        }

        return deltaX > 0 ? 'right' : 'left';
    }

    getStableGesture() {
        if (this.gestureHistory.length < this.gestureStabilityFrames) {
            return null;
        }

        const lastGesture = this.gestureHistory[this.gestureHistory.length - 1];
        const isStable = this.gestureHistory.every(gesture => gesture === lastGesture);

        return isStable ? lastGesture : null;
    }

    calculatePointingVector(fingerTip, wrist) {
        const deltaX = -(fingerTip.x - wrist.x);
        const deltaY = fingerTip.y - wrist.y;
        const magnitude = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (magnitude > 0.02) {
            return {
                x: deltaX / magnitude,
                y: deltaY / magnitude,
                magnitude: magnitude
            };
        }

        return null;
    }

    triggerGestureCallback(gesture) {
        if (gesture && this.gestureCallbacks[gesture]) {
            this.gestureCallbacks[gesture]();
        }
        if (gesture === null && this.gestureCallbacks['none']) {
            this.gestureCallbacks['none']();
        }
    }

    onGesture(gesture, callback) {
        this.gestureCallbacks[gesture] = callback;
    }
}

// Game Class
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            console.error('Canvas not found!');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.gestureController = new GestureController();
        this.gestureEnabled = false;
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        // Game state
        this.level = 1;
        this.deaths = 0;
        this.startTime = Date.now();
        this.gameOver = false;
        this.paused = false;
        this.time = 0;

        // Level system
        this.maxLevels = 15;
        this.levelProgress = this.loadProgress();
        this.currentSelectedLevel = 1;

        // Visual effects
        this.particles = [];
        this.screenShake = 0;
        this.flashEffect = 0;
        this.backgroundPattern = null;

        // Player
        this.player = {
            x: 50, y: 300, width: 22, height: 22,
            speed: 3.5, hyperSpeed: 8.0, trail: [],
            glowIntensity: 0, bounceOffset: 0, color: '#00ff00'
        };

        // Power-ups system
        this.powerUps = [];
        this.powerUpEffects = {
            shield: { active: false, duration: 0, maxDuration: 5000 },
            speed: { active: false, duration: 0, maxDuration: 3000, multiplier: 1.5 },
            slowMotion: { active: false, duration: 0, maxDuration: 4000, multiplier: 0.5 }
        };

        // Scoring system
        this.score = 0;
        this.multiplier = 1;
        this.combo = 0;
        this.floatingTexts = [];

        // Speed multipliers
        this.speedMultiplier = 1;
        this.timeMultiplier = 1;

        // Input handling
        this.keys = {};
        this.gestureKeys = {};
        this.currentGestureDirection = null;

        // Game objects
        this.obstacles = [];
        this.collectibles = [];
        this.goal = null;

        // Audio context
        this.audioContext = null;

        // Initialize
        this.backgroundPattern = this.createBackgroundPattern();
        this.setupInput();
        this.setupGestureCallbacks();
        this.initAudio();
        this.initLevel();
        this.gameLoop();
    }

    setupGestureCallbacks() {
        this.gestureController.onGesture('up', () => {
            this.currentGestureDirection = 'up';
            this.updateGestureKeys();
        });
        this.gestureController.onGesture('down', () => {
            this.currentGestureDirection = 'down';
            this.updateGestureKeys();
        });
        this.gestureController.onGesture('left', () => {
            this.currentGestureDirection = 'left';
            this.updateGestureKeys();
        });
        this.gestureController.onGesture('right', () => {
            this.currentGestureDirection = 'right';
            this.updateGestureKeys();
        });
        this.gestureController.onGesture('open_hand', () => {
            this.currentGestureDirection = null;
            this.gestureKeys = {};
            if (this.gameOver) this.restart();
        });
        this.gestureController.onGesture('none', () => {
            this.currentGestureDirection = null;
            this.gestureKeys = {};
        });
    }

    updateGestureKeys() {
        this.gestureKeys = {};
        switch (this.currentGestureDirection) {
            case 'up': this.gestureKeys['w'] = true; break;
            case 'down': this.gestureKeys['s'] = true; break;
            case 'left': this.gestureKeys['a'] = true; break;
            case 'right': this.gestureKeys['d'] = true; break;
        }
    }

    async enableGestures() {
        const initialized = await this.gestureController.initialize();
        if (initialized) {
            const started = await this.gestureController.start();
            if (started) {
                this.gestureEnabled = true;
                return true;
            }
        }
        return false;
    }

    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Audio not supported');
        }
    }

    playSound(frequency, duration, type = 'sine') {
        if (!this.audioContext) return;
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            oscillator.frequency.value = frequency;
            oscillator.type = type;
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (e) {
            console.log('Error playing sound:', e);
        }
    }

    playCollisionSound() {
        this.playSound(150, 0.3, 'sawtooth');
        setTimeout(() => this.playSound(100, 0.2, 'square'), 50);
        setTimeout(() => this.playSound(80, 0.4, 'sawtooth'), 100);
    }

    playCollectSound() {
        this.playSound(800, 0.15, 'sine');
        setTimeout(() => this.playSound(1000, 0.1, 'sine'), 80);
        setTimeout(() => this.playSound(1200, 0.1, 'sine'), 140);
    }

    playVictorySound() {
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playSound(freq, 0.3, 'sine'), i * 150);
        });
    }

    playStartSound() {
        this.playSound(400, 0.2, 'triangle');
        setTimeout(() => this.playSound(600, 0.2, 'triangle'), 100);
    }

    loadProgress() {
        try {
            const saved = localStorage.getItem('gameProgress');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.error('Error loading progress:', e);
        }
        return {};
    }

    saveProgress() {
        try {
            localStorage.setItem('gameProgress', JSON.stringify(this.levelProgress));
        } catch (e) {
            console.error('Error saving progress:', e);
        }
    }

    generatePowerUps() {
        const powerUpCount = Math.floor(Math.random() * 3) + 1;
        const powerUpTypes = ['shield', 'speed', 'slowMotion'];

        for (let i = 0; i < powerUpCount; i++) {
            const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
            this.powerUps.push({
                x: 200 + Math.random() * (this.width - 400),
                y: 100 + Math.random() * (this.height - 200),
                width: 20, height: 20, type: type, collected: false,
                pulseTime: 0, color: this.getPowerUpColor(type)
            });
        }
    }

    getPowerUpColor(type) {
        switch (type) {
            case 'shield': return '#00ffff';
            case 'speed': return '#ff8800';
            case 'slowMotion': return '#8800ff';
            default: return '#ffffff';
        }
    }

    updatePowerUps() {
        this.powerUps.forEach(powerUp => { powerUp.pulseTime += 0.1; });

        Object.keys(this.powerUpEffects).forEach(key => {
            const effect = this.powerUpEffects[key];
            if (effect.active) {
                effect.duration -= 16;
                if (effect.duration <= 0) {
                    effect.active = false;
                    this.onPowerUpExpired(key);
                }
            }
        });
    }

    collectPowerUp(powerUp) {
        if (powerUp.collected) return;
        powerUp.collected = true;
        this.activatePowerUp(powerUp.type);
        this.playSound(1200, 0.2, 'sine');
        setTimeout(() => this.playSound(1400, 0.15, 'sine'), 100);

        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: powerUp.x + powerUp.width / 2,
                y: powerUp.y + powerUp.height / 2,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 1, decay: 0.02, color: powerUp.color,
                size: Math.random() * 4 + 2
            });
        }
    }

    activatePowerUp(type) {
        const effect = this.powerUpEffects[type];
        effect.active = true;
        effect.duration = effect.maxDuration;

        switch (type) {
            case 'shield': this.player.glowIntensity = 1; break;
            case 'speed': this.speedMultiplier = effect.multiplier || 1; break;
            case 'slowMotion': this.timeMultiplier = effect.multiplier || 1; break;
        }
    }

    onPowerUpExpired(type) {
        switch (type) {
            case 'shield': this.player.glowIntensity = 0; break;
            case 'speed': this.speedMultiplier = 1; break;
            case 'slowMotion': this.timeMultiplier = 1; break;
        }
    }

    showFloatingText(text, x, y, color = '#ffffff', size = 16) {
        this.floatingTexts.push({
            text: text, x: x, y: y, originalY: y, color: color,
            size: size, life: 1, decay: 0.02, velocity: -2
        });
    }

    updateFloatingTexts() {
        this.floatingTexts = this.floatingTexts.filter(text => {
            text.y += text.velocity;
            text.life -= text.decay;
            text.velocity *= 0.98;
            return text.life > 0;
        });
    }

    createBackgroundPattern() {
        try {
            const patternCanvas = document.createElement('canvas');
            patternCanvas.width = 40;
            patternCanvas.height = 40;
            const patternCtx = patternCanvas.getContext('2d');
            if (!patternCtx) return null;

            patternCtx.strokeStyle = '#222';
            patternCtx.lineWidth = 1;
            patternCtx.beginPath();
            patternCtx.moveTo(0, 20);
            patternCtx.lineTo(40, 20);
            patternCtx.moveTo(20, 0);
            patternCtx.lineTo(20, 40);
            patternCtx.stroke();

            return this.ctx.createPattern(patternCanvas, 'repeat');
        } catch (e) {
            console.error('Error creating background pattern:', e);
            return null;
        }
    }

    setupInput() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            if (e.key === ' ' && this.gameOver) this.restart();
        });
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }

    restart() {
        this.gameOver = false;
        this.deaths = 0;
        this.startTime = Date.now();
        this.score = 0;
        this.combo = 0;
        this.initLevel();
    }

    initLevel() {
        this.obstacles = [];
        this.collectibles = [];
        this.powerUps = [];
        this.player.x = 50;
        this.player.y = 300;

        Object.keys(this.powerUpEffects).forEach(key => {
            const effect = this.powerUpEffects[key];
            effect.active = false;
            effect.duration = 0;
        });

        this.playStartSound();
        this.generatePowerUps();
        this.createLevelContent();

        this.goal = {
            x: this.width - 80, y: this.height / 2 - 40,
            width: 60, height: 80, color: '#ffff00'
        };
    }

    createLevelContent() {
        switch (this.level) {
            case 1: this.createLevel1(); break;
            case 2: this.createLevel2(); break;
            case 3: this.createLevel3(); break;
            case 4: this.createLevel4(); break;
            case 5: this.createLevel5(); break;
            default: this.createRandomLevel(); break;
        }
    }

    createLevel1() {
        for (let i = 0; i < 5; i++) {
            this.obstacles.push({
                x: 180 + i * 120, y: 150 + i * 60, width: 18, height: 18,
                speedX: 3.5 + i * 0.7, speedY: 2 + i * 0.5, color: '#ff0000'
            });
        }
        this.collectibles.push(
            { x: 350, y: 250, width: 9, height: 9, collected: false, color: '#0088ff' },
            { x: 500, y: 350, width: 9, height: 9, collected: false, color: '#0088ff' }
        );
    }

    createLevel2() {
        for (let i = 0; i < 7; i++) {
            this.obstacles.push({
                x: 140 + i * 90, y: 120 + Math.sin(i * 0.8) * 80,
                width: 16, height: 16,
                speedX: 4.5 * (i % 2 === 0 ? 1 : -1),
                speedY: 3 * (i % 2 === 0 ? 1 : -1), color: '#ff0000'
            });
        }
        for (let i = 0; i < 2; i++) {
            this.obstacles.push({
                x: 400, y: 200, width: 14, height: 14,
                angle: i * Math.PI, radius: 60 + i * 30,
                speed: 0.08 + i * 0.02, color: '#ff0000'
            });
        }
        for (let i = 0; i < 3; i++) {
            this.collectibles.push({
                x: 280 + i * 160, y: 200 + i * 80,
                width: 8, height: 8, collected: false, color: '#0088ff'
            });
        }
    }

    createLevel3() {
        for (let i = 0; i < 6; i++) {
            this.obstacles.push({
                x: 300, y: 300, width: 17, height: 17,
                angle: i * Math.PI / 3, radius: 80 + i * 25,
                speed: 0.07 + i * 0.015, color: '#ff0000'
            });
        }
        for (let i = 0; i < 3; i++) {
            this.obstacles.push({
                x: 150 + i * 200, y: 100 + i * 150, width: 16, height: 16,
                speedX: 5 * (i % 2 === 0 ? 1 : -1),
                speedY: 3.5 * (i % 2 === 0 ? 1 : -1), color: '#ff0000'
            });
        }
        this.collectibles.push(
            { x: 295, y: 295, width: 8, height: 8, collected: false, color: '#0088ff' },
            { x: 450, y: 200, width: 8, height: 8, collected: false, color: '#0088ff' }
        );
    }

    createLevel4() {
        for (let i = 0; i < 8; i++) {
            this.obstacles.push({
                x: 400, y: 300, width: 15, height: 15,
                angle: i * Math.PI / 4, radius: 80 + i * 10,
                speed: 0.1, color: '#ff0000', type: 'spiral'
            });
        }
        for (let i = 0; i < 4; i++) {
            this.obstacles.push({
                x: 100 + i * 150, y: 100 + i * 100, width: 20, height: 20,
                speedX: 6 * (i % 2 === 0 ? 1 : -1),
                speedY: 4 * (i % 2 === 0 ? 1 : -1), color: '#ff0000'
            });
        }
        this.collectibles.push(
            { x: 200, y: 200, width: 8, height: 8, collected: false, color: '#0088ff' },
            { x: 600, y: 400, width: 8, height: 8, collected: false, color: '#0088ff' },
            { x: 400, y: 100, width: 8, height: 8, collected: false, color: '#0088ff' }
        );
    }

    createLevel5() {
        const movingWalls = [
            { x: 150, y: 50, width: 15, height: 180, speedY: 2.5, minY: 50, maxY: 370 },
            { x: 280, y: 200, width: 15, height: 160, speedY: -3, minY: 50, maxY: 390 },
            { x: 420, y: 100, width: 15, height: 200, speedY: 2, minY: 50, maxY: 350 },
            { x: 550, y: 250, width: 15, height: 140, speedY: -2.5, minY: 100, maxY: 410 }
        ];

        movingWalls.forEach(wall => {
            this.obstacles.push({
                x: wall.x, y: wall.y, width: wall.width, height: wall.height,
                speedX: 0, speedY: wall.speedY, minY: wall.minY, maxY: wall.maxY,
                color: '#ff0000', type: 'movingWall'
            });
        });

        for (let i = 0; i < 3; i++) {
            this.obstacles.push({
                x: 350, y: 280, width: 16, height: 16,
                angle: i * (Math.PI * 2 / 3), radius: 60 + i * 10,
                speed: 0.08 + i * 0.02, color: '#ff0000', type: 'circular'
            });
        }

        this.collectibles.push(
            { x: 200, y: 120, width: 8, height: 8, collected: false, color: '#0088ff' },
            { x: 380, y: 180, width: 8, height: 8, collected: false, color: '#0088ff' },
            { x: 500, y: 320, width: 8, height: 8, collected: false, color: '#0088ff' },
            { x: 320, y: 450, width: 8, height: 8, collected: false, color: '#0088ff' }
        );
    }

    createRandomLevel() {
        const obstacleCount = Math.min(5 + this.level, 15);
        for (let i = 0; i < obstacleCount; i++) {
            this.obstacles.push({
                x: 100 + Math.random() * (this.width - 200),
                y: 50 + Math.random() * (this.height - 100),
                width: 15 + Math.random() * 10,
                height: 15 + Math.random() * 10,
                speedX: (Math.random() - 0.5) * 8,
                speedY: (Math.random() - 0.5) * 8,
                color: '#ff0000'
            });
        }

        const collectibleCount = Math.min(2 + Math.floor(this.level / 3), 6);
        for (let i = 0; i < collectibleCount; i++) {
            this.collectibles.push({
                x: 150 + Math.random() * (this.width - 300),
                y: 100 + Math.random() * (this.height - 200),
                width: 8, height: 8, collected: false, color: '#0088ff'
            });
        }
    }

    gameLoop() {
        try {
            this.update();
            this.render();
            requestAnimationFrame(() => this.gameLoop());
        } catch (e) {
            console.error('Error in game loop:', e);
        }
    }

    update() {
        if (this.gameOver || this.paused) return;
        this.time = (Date.now() - this.startTime) / 1000;
        this.updatePlayer();
        this.updateObstacles();
        this.updateCollectibles();
        this.updatePowerUps();
        this.updateParticles();
        this.updateFloatingTexts();
        this.checkCollisions();
        this.checkWinCondition();
    }

    updatePlayer() {
        const currentSpeed = this.player.speed * this.speedMultiplier;
        const hyperSpeedActive = this.keys[' '] || this.keys['space'];
        const actualSpeed = hyperSpeedActive ? this.player.hyperSpeed : currentSpeed;

        const moveUp = this.keys['w'] || this.keys['arrowup'] || this.gestureKeys['w'];
        const moveDown = this.keys['s'] || this.keys['arrowdown'] || this.gestureKeys['s'];
        const moveLeft = this.keys['a'] || this.keys['arrowleft'] || this.gestureKeys['a'];
        const moveRight = this.keys['d'] || this.keys['arrowright'] || this.gestureKeys['d'];

        if (moveUp && this.player.y > 0) {
            this.player.y -= actualSpeed * this.timeMultiplier;
        }
        if (moveDown && this.player.y < this.height - this.player.height) {
            this.player.y += actualSpeed * this.timeMultiplier;
        }
        if (moveLeft && this.player.x > 0) {
            this.player.x -= actualSpeed * this.timeMultiplier;
        }
        if (moveRight && this.player.x < this.width - this.player.width) {
            this.player.x += actualSpeed * this.timeMultiplier;
        }

        this.player.trail.push({ x: this.player.x, y: this.player.y });
        if (this.player.trail.length > 10) {
            this.player.trail.shift();
        }

        this.player.bounceOffset = Math.sin(Date.now() * 0.01) * 2;
    }

    updateObstacles() {
        this.obstacles.forEach(obstacle => {
            if (obstacle.angle !== undefined && obstacle.radius !== undefined && obstacle.speed !== undefined) {
                obstacle.angle += obstacle.speed * this.timeMultiplier;
                const centerX = obstacle.x;
                const centerY = obstacle.y;
                obstacle.x = centerX + Math.cos(obstacle.angle) * obstacle.radius;
                obstacle.y = centerY + Math.sin(obstacle.angle) * obstacle.radius;
            } else {
                if (obstacle.speedX !== undefined) {
                    obstacle.x += obstacle.speedX * this.timeMultiplier;
                }
                if (obstacle.speedY !== undefined) {
                    obstacle.y += obstacle.speedY * this.timeMultiplier;
                }

                if (obstacle.x < 0 || obstacle.x > this.width - obstacle.width) {
                    if (obstacle.speedX !== undefined) {
                        obstacle.speedX = -obstacle.speedX;
                    }
                }
                if (obstacle.y < 0 || obstacle.y > this.height - obstacle.height) {
                    if (obstacle.speedY !== undefined) {
                        obstacle.speedY = -obstacle.speedY;
                    }
                }

                if (obstacle.type === 'movingWall' && obstacle.minY !== undefined && obstacle.maxY !== undefined) {
                    if (obstacle.y <= obstacle.minY || obstacle.y >= obstacle.maxY) {
                        if (obstacle.speedY !== undefined) {
                            obstacle.speedY = -obstacle.speedY;
                        }
                    }
                }
            }
        });
    }

    updateCollectibles() {
        // Simple pulse effect for collectibles
    }

    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= particle.decay;
            particle.size *= 0.98;
            return particle.life > 0;
        });
    }

    checkCollisions() {
        this.obstacles.forEach(obstacle => {
            if (this.isColliding(this.player, obstacle)) {
                if (!this.powerUpEffects.shield.active) {
                    this.playerDied();
                }
            }
        });

        this.collectibles.forEach(collectible => {
            if (!collectible.collected && this.isColliding(this.player, collectible)) {
                collectible.collected = true;
                this.playCollectSound();
                this.score += 100 * this.multiplier;
                this.combo++;
                this.showFloatingText(`+${100 * this.multiplier}`, collectible.x, collectible.y, '#00ff00');
            }
        });

        this.powerUps.forEach(powerUp => {
            if (!powerUp.collected && this.isColliding(this.player, powerUp)) {
                this.collectPowerUp(powerUp);
            }
        });
    }

    isColliding(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }

    checkWinCondition() {
        if (this.goal && this.isColliding(this.player, this.goal)) {
            const allCollected = this.collectibles.every(c => c.collected);
            if (allCollected) {
                this.levelCompleted();
            }
        }
    }

    playerDied() {
        this.deaths++;
        this.playCollisionSound();
        this.screenShake = 10;
        this.flashEffect = 1;
        this.player.x = 50;
        this.player.y = 300;
        this.combo = 0;

        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: this.player.x + this.player.width / 2,
                y: this.player.y + this.player.height / 2,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1, decay: 0.03, color: '#ff0000',
                size: Math.random() * 6 + 2
            });
        }
    }

    levelCompleted() {
        this.gameOver = true;
        this.playVictorySound();

        const levelTime = this.time;
        if (!this.levelProgress[this.level] || levelTime < this.levelProgress[this.level].bestTime) {
            this.levelProgress[this.level] = {
                completed: true,
                bestTime: levelTime,
                deaths: this.deaths
            };
            this.saveProgress();
        }

        this.showLevelCompleteUI();
    }

    showLevelCompleteUI() {
        const gameOverDiv = document.getElementById('gameOver');
        if (gameOverDiv) {
            gameOverDiv.style.display = 'block';
            const completionTime = document.getElementById('completionTime');
            const totalDeaths = document.getElementById('totalDeaths');
            const newRecord = document.getElementById('newRecord');

            if (completionTime) completionTime.textContent = this.time.toFixed(2);
            if (totalDeaths) totalDeaths.textContent = this.deaths.toString();

            if (newRecord && this.levelProgress[this.level] && this.time <= this.levelProgress[this.level].bestTime) {
                newRecord.style.display = 'block';
            }
        }
    }

    render() {
        try {
            this.ctx.fillStyle = '#111';
            this.ctx.fillRect(0, 0, this.width, this.height);

            if (this.backgroundPattern) {
                this.ctx.fillStyle = this.backgroundPattern;
                this.ctx.fillRect(0, 0, this.width, this.height);
            }

            if (this.screenShake > 0) {
                this.ctx.save();
                this.ctx.translate(
                    (Math.random() - 0.5) * this.screenShake,
                    (Math.random() - 0.5) * this.screenShake
                );
                this.screenShake *= 0.9;
            }

            if (this.flashEffect > 0) {
                this.ctx.save();
                this.ctx.globalAlpha = this.flashEffect;
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillRect(0, 0, this.width, this.height);
                this.ctx.restore();
                this.flashEffect *= 0.8;
            }

            this.drawPlayer();
            this.drawObstacles();
            this.drawCollectibles();
            this.drawPowerUps();
            this.drawGoal();
            this.drawParticles();
            this.drawFloatingTexts();
            this.drawUI();

            if (this.screenShake > 0) {
                this.ctx.restore();
            }
        } catch (e) {
            console.error('Error in render:', e);
        }
    }

    drawPlayer() {
        this.ctx.save();
        this.player.trail.forEach((pos, index) => {
            const alpha = index / this.player.trail.length;
            this.ctx.globalAlpha = alpha * 0.5;
            this.ctx.fillStyle = this.player.color;
            this.ctx.fillRect(pos.x, pos.y, this.player.width * alpha, this.player.height * alpha);
        });
        this.ctx.restore();

        if (this.player.glowIntensity > 0) {
            this.ctx.save();
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = '#00ffff';
        }

        this.ctx.fillStyle = this.player.color;
        this.ctx.fillRect(
            this.player.x,
            this.player.y + this.player.bounceOffset,
            this.player.width,
            this.player.height
        );

        if (this.player.glowIntensity > 0) {
            this.ctx.restore();
        }
    }

    drawObstacles() {
        this.obstacles.forEach(obstacle => {
            if (obstacle.visible !== false) {
                this.ctx.fillStyle = obstacle.color;
                this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            }
        });
    }

    drawCollectibles() {
        this.collectibles.forEach(collectible => {
            if (!collectible.collected) {
                const pulse = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
                this.ctx.save();
                this.ctx.globalAlpha = pulse;
                this.ctx.fillStyle = collectible.color;
                this.ctx.fillRect(collectible.x, collectible.y, collectible.width, collectible.height);
                this.ctx.restore();
            }
        });
    }

    drawPowerUps() {
        this.powerUps.forEach(powerUp => {
            if (!powerUp.collected) {
                const pulse = Math.sin(powerUp.pulseTime) * 0.3 + 0.7;
                this.ctx.save();
                this.ctx.globalAlpha = pulse;
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = powerUp.color;
                this.ctx.fillStyle = powerUp.color;
                this.ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
                this.ctx.restore();
            }
        });
    }

    drawGoal() {
        if (this.goal) {
            const pulse = Math.sin(Date.now() * 0.003) * 0.2 + 0.8;
            this.ctx.save();
            this.ctx.globalAlpha = pulse;
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = this.goal.color;
            this.ctx.fillStyle = this.goal.color;
            this.ctx.fillRect(this.goal.x, this.goal.y, this.goal.width, this.goal.height);
            this.ctx.restore();
        }
    }

    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            this.ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
            this.ctx.restore();
        });
    }

    drawFloatingTexts() {
        this.floatingTexts.forEach(text => {
            this.ctx.save();
            this.ctx.globalAlpha = text.life;
            this.ctx.fillStyle = text.color;
            this.ctx.font = `${text.size}px Arial`;
            this.ctx.fillText(text.text, text.x, text.y);
            this.ctx.restore();
        });
    }

    drawUI() {
        const levelElement = document.getElementById('level');
        const deathsElement = document.getElementById('deaths');
        const timeElement = document.getElementById('time');
        const scoreElement = document.getElementById('score');
        const comboElement = document.getElementById('combo');

        if (levelElement) levelElement.textContent = this.level.toString();
        if (deathsElement) deathsElement.textContent = this.deaths.toString();
        if (timeElement) timeElement.textContent = this.time.toFixed(1);
        if (scoreElement) scoreElement.textContent = this.score.toString();
        if (comboElement) comboElement.textContent = this.combo.toString();
    }
}

// Global functions for HTML interaction
function startCamera() {
    if (window.game) {
        window.game.enableGestures().then(success => {
            if (success) {
                document.getElementById('cameraPermission').style.display = 'none';
                document.getElementById('gameContainer').style.display = 'block';
            } else {
                alert('No se pudo activar la cámara. Jugarás sin gestos.');
                playWithoutCamera();
            }
        });
    }
}

function playWithoutCamera() {
    document.getElementById('cameraPermission').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';
}

function showLevelMenu() {
    console.log('Show level menu');
}

function showSettings() {
    console.log('Show settings');
}

function nextLevel() {
    if (window.game) {
        window.game.level++;
        window.game.initLevel();
        document.getElementById('gameOver').style.display = 'none';
    }
}

function restartLevel() {
    if (window.game) {
        window.game.restart();
        document.getElementById('gameOver').style.display = 'none';
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.game = new Game();
        console.log('Game initialized successfully!');
    } catch (e) {
        console.error('Error initializing game:', e);
    }
});