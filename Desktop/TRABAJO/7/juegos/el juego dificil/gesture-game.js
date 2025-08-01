// Gesture Recognition System
class GestureController {
    constructor() {
        this.hands = null;
        this.camera = null;
        this.videoElement = null;
        this.isActive = false;
        this.currentGesture = null;
        this.gestureCallbacks = {};

        // Gesture detection parameters
        this.fingerThreshold = 0.8;
        this.gestureStabilityFrames = 2;
        this.gestureHistory = [];
    }

    async initialize() {
        try {
            this.videoElement = document.getElementById('videoElement');

            // Initialize MediaPipe Hands
            this.hands = new Hands({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                }
            });

            this.hands.setOptions({
                maxNumHands: 1,
                modelComplexity: 1,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            this.hands.onResults(this.onResults.bind(this));

            // Initialize camera
            this.camera = new Camera(this.videoElement, {
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
                document.getElementById('cameraContainer').style.display = 'block';
                return true;
            }
        } catch (error) {
            console.error('Error starting camera:', error);
            return false;
        }
    }

    stop() {
        if (this.camera) {
            this.camera.stop();
            this.isActive = false;
            document.getElementById('cameraContainer').style.display = 'none';
        }
    }

    onResults(results) {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            const gesture = this.recognizeGesture(landmarks);

            // Calculate pointing direction for continuous movement
            const indexTip = landmarks[8];
            const wrist = landmarks[0];
            this.currentPointingVector = this.calculatePointingVector(indexTip, wrist);

            // Add to history for stability
            this.gestureHistory.push(gesture);
            if (this.gestureHistory.length > this.gestureStabilityFrames) {
                this.gestureHistory.shift();
            }

            // Check for stable gesture
            const stableGesture = this.getStableGesture();
            if (stableGesture !== this.currentGesture) {
                this.currentGesture = stableGesture;
                this.triggerGestureCallback(stableGesture);
            }
        } else {
            // No hand detected
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

        // Calculate finger extensions
        const indexExtended = indexTip.y < indexPip.y - 0.015;
        const middleExtended = middleTip.y < middlePip.y - 0.015;
        const ringExtended = ringTip.y < ringPip.y - 0.015;
        const pinkyExtended = pinkyTip.y < pinkyPip.y - 0.015;
        const thumbExtended = Math.abs(thumbTip.x - thumbIp.x) > 0.015;

        const extendedCount = [thumbExtended, indexExtended, middleExtended, ringExtended, pinkyExtended].filter(Boolean).length;

        // Open hand gesture - 4 or 5 fingers extended
        if (extendedCount >= 4) {
            return 'open_hand';
        }

        // Pointing gesture - primarily index finger
        if (indexExtended && extendedCount <= 2) {
            const direction = this.getPointingDirection(indexTip, wrist);
            return direction;
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
        if (this.gestureCallbacks[gesture]) {
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
        this.ctx = this.canvas.getContext('2d');

        // Initialize gesture controller
        this.gestureController = new GestureController();
        this.gestureEnabled = false;

        this.width = this.canvas.width;
        this.height = this.canvas.height;

        // Load Tony image
        this.tonyImage = new Image();
        this.tonyImage.src = 'img/TonyOriginal.png';
        this.imageLoaded = false;
        this.tonyImage.onload = () => {
            this.imageLoaded = true;
        };

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
        this.backgroundPattern = this.createBackgroundPattern();

        // Player with enhanced properties
        this.player = {
            x: 50,
            y: 300,
            width: 22,
            height: 22,
            speed: 3.5,
            hyperSpeed: 8.0,
            trail: [],
            glowIntensity: 0,
            bounceOffset: 0
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
        this.setupInput();
        this.setupGestureCallbacks();

        // Game objects
        this.obstacles = [];
        this.collectibles = [];
        this.goal = null;

        // Audio context for sound effects
        this.audioContext = null;
        this.initAudio();

        // Initialize level
        this.initLevel();

        // Start game loop
        this.gameLoop();
    }

    setupGestureCallbacks() {
        this.currentGestureDirection = null;

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
            if (this.gameOver) {
                this.restart();
            }
        });

        this.gestureController.onGesture('none', () => {
            this.currentGestureDirection = null;
            this.gestureKeys = {};
        });
    }

    updateGestureKeys() {
        this.gestureKeys = {};

        switch (this.currentGestureDirection) {
            case 'up':
                this.gestureKeys['w'] = true;
                break;
            case 'down':
                this.gestureKeys['s'] = true;
                break;
            case 'left':
                this.gestureKeys['a'] = true;
                break;
            case 'right':
                this.gestureKeys['d'] = true;
                break;
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

    playMenuSound() {
        this.playSound(600, 0.1, 'sine');
    }

    playStartSound() {
        this.playSound(400, 0.2, 'triangle');
        setTimeout(() => this.playSound(600, 0.2, 'triangle'), 100);
    }

    generatePowerUps() {
        const powerUpCount = Math.floor(Math.random() * 3) + 1;
        const powerUpTypes = ['shield', 'speed', 'slowMotion'];

        for (let i = 0; i < powerUpCount; i++) {
            const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
            this.powerUps.push({
                x: 200 + Math.random() * (this.width - 400),
                y: 100 + Math.random() * (this.height - 200),
                width: 20,
                height: 20,
                type: type,
                collected: false,
                pulseTime: 0,
                color: this.getPowerUpColor(type)
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
        this.powerUps.forEach(powerUp => {
            powerUp.pulseTime += 0.1;
        });

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
                life: 1,
                decay: 0.02,
                color: powerUp.color,
                size: Math.random() * 4 + 2
            });
        }
    }

    activatePowerUp(type) {
        const effect = this.powerUpEffects[type];
        effect.active = true;
        effect.duration = effect.maxDuration;

        switch (type) {
            case 'shield':
                this.player.glowIntensity = 1;
                break;
            case 'speed':
                this.speedMultiplier = effect.multiplier;
                break;
            case 'slowMotion':
                this.timeMultiplier = effect.multiplier;
                break;
        }
    }

    onPowerUpExpired(type) {
        switch (type) {
            case 'shield':
                this.player.glowIntensity = 0;
                break;
            case 'speed':
                this.speedMultiplier = 1;
                break;
            case 'slowMotion':
                this.timeMultiplier = 1;
                break;
        }
    }

    showFloatingText(text, x, y, color = '#ffffff', size = 16) {
        this.floatingTexts.push({
            text: text,
            x: x,
            y: y,
            originalY: y,
            color: color,
            size: size,
            life: 1,
            decay: 0.02,
            velocity: -2
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
        const patternCanvas = document.createElement('canvas');
        patternCanvas.width = 40;
        patternCanvas.height = 40;
        const patternCtx = patternCanvas.getContext('2d');

        patternCtx.strokeStyle = '#222';
        patternCtx.lineWidth = 1;
        patternCtx.beginPath();
        patternCtx.moveTo(0, 20);
        patternCtx.lineTo(40, 20);
        patternCtx.moveTo(20, 0);
        patternCtx.lineTo(20, 40);
        patternCtx.stroke();

        return this.ctx.createPattern(patternCanvas, 'repeat');
    }

    setupInput() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            if (e.key === ' ' && this.gameOver) {
                this.restart();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }

    initLevel() {
        this.obstacles = [];
        this.collectibles = [];
        this.powerUps = [];

        this.player.x = 50;
        this.player.y = 300;

        // Reset power-up effects
        Object.keys(this.powerUpEffects).forEach(key => {
            this.powerUpEffects[key].active = false;
            this.powerUpEffects[key].duration = 0;
        });

        this.playStartSound();
        this.generatePowerUps();

        switch (this.level) {
            case 1:
                this.createLevel1();
                break;
            case 2:
                this.createLevel2();
                break;
            case 3:
                this.createLevel3();
                break;
            case 4:
                this.createLevel4();
                break;
            case 5:
                this.createLevel5();
                break;
            case 6:
                this.createLevel6();
                break;
            case 7:
                this.createLevel7();
                break;
            case 8:
                this.createLevel8();
                break;
            case 9:
                this.createLevel9();
                break;
            case 10:
                this.createLevel10();
                break;
            case 11:
                this.createLevel11();
                break;
            case 12:
                this.createLevel12();
                break;
            case 13:
                this.createLevel13();
                break;
            case 14:
                this.createLevel14();
                break;
            case 15:
                this.createLevel15();
                break;
            default:
                this.createRandomLevel();
        }

        this.goal = {
            x: this.width - 80,
            y: this.height / 2 - 40,
            width: 60,
            height: 80,
            color: '#ffff00'
        };
    }

    createLevel1() {
        for (let i = 0; i < 5; i++) {
            this.obstacles.push({
                x: 180 + i * 120,
                y: 150 + i * 60,
                width: 18,
                height: 18,
                speedX: 3.5 + i * 0.7,
                speedY: 2 + i * 0.5,
                color: '#ff0000'
            });
        }

        this.collectibles.push({
            x: 350, y: 250, width: 9, height: 9,
            collected: false, color: '#0088ff'
        });

        this.collectibles.push({
            x: 500, y: 350, width: 9, height: 9,
            collected: false, color: '#0088ff'
        });
    }

    createLevel2() {
        for (let i = 0; i < 7; i++) {
            this.obstacles.push({
                x: 140 + i * 90,
                y: 120 + Math.sin(i * 0.8) * 80,
                width: 16,
                height: 16,
                speedX: 4.5 * (i % 2 === 0 ? 1 : -1),
                speedY: 3 * (i % 2 === 0 ? 1 : -1),
                color: '#ff0000'
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
                x: 150 + i * 200, y: 100 + i * 150,
                width: 16, height: 16,
                speedX: 5 * (i % 2 === 0 ? 1 : -1),
                speedY: 3.5 * (i % 2 === 0 ? 1 : -1),
                color: '#ff0000'
            });
        }

        this.collectibles.push({
            x: 295, y: 295, width: 8, height: 8,
            collected: false, color: '#0088ff'
        });

        this.collectibles.push({
            x: 450, y: 200, width: 8, height: 8,
            collected: false, color: '#0088ff'
        });
    }

    // NIVEL 4: "El Laberinto Giratorio"
    createLevel4() {
        // Obstáculos en espiral doble
        for (let i = 0; i < 8; i++) {
            this.obstacles.push({
                x: 400, y: 300, width: 15, height: 15,
                angle: i * Math.PI / 4, radius: 80 + i * 10,
                speed: 0.1, color: '#ff0000', type: 'spiral'
            });
        }

        // Obstáculos lineales rápidos
        for (let i = 0; i < 4; i++) {
            this.obstacles.push({
                x: 100 + i * 150, y: 100 + i * 100,
                width: 20, height: 20,
                speedX: 6 * (i % 2 === 0 ? 1 : -1),
                speedY: 4 * (i % 2 === 0 ? 1 : -1),
                color: '#ff0000'
            });
        }

        this.collectibles.push(
            { x: 200, y: 200, width: 8, height: 8, collected: false, color: '#0088ff' },
            { x: 600, y: 400, width: 8, height: 8, collected: false, color: '#0088ff' },
            { x: 400, y: 100, width: 8, height: 8, collected: false, color: '#0088ff' }
        );
    }

    // NIVEL 5: "El Laberinto Móvil"
    createLevel5() {
        // Paredes móviles verticales
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

        // Obstáculos circulares en formación triangular
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

    // NIVEL 6: "La Tormenta de Fuego"
    createLevel6() {
        // Obstáculos que aparecen y desaparecen
        for (let i = 0; i < 6; i++) {
            this.obstacles.push({
                x: 150 + i * 100, y: 150 + Math.sin(i) * 100,
                width: 25, height: 25, type: 'blinking',
                visible: true, blinkTimer: i * 20, blinkInterval: 120,
                color: '#ff4444'
            });
        }

        // Obstáculos que siguen al jugador
        for (let i = 0; i < 2; i++) {
            this.obstacles.push({
                x: 400 + i * 100, y: 200 + i * 100,
                width: 18, height: 18, speed: 1.5 + i * 0.3,
                type: 'follower', color: '#ff6666'
            });
        }

        // Obstáculos en zigzag
        this.obstacles.push({
            x: 200, y: 100, width: 20, height: 20,
            speedX: 3, speedY: 2, type: 'zigzag',
            direction: 1, color: '#ff8888'
        });

        this.collectibles.push(
            { x: 300, y: 300, width: 8, height: 8, collected: false, color: '#0088ff' },
            { x: 500, y: 150, width: 8, height: 8, collected: false, color: '#0088ff' },
            { x: 150, y: 400, width: 8, height: 8, collected: false, color: '#0088ff' }
        );
    }

    // NIVEL 7: "El Vórtice Doble"
    createLevel7() {
        // Dos vórtices giratorios
        for (let i = 0; i < 6; i++) {
            // Vórtice 1
            this.obstacles.push({
                x: 250, y: 200, width: 14, height: 14,
                angle: i * Math.PI / 3, radius: 70 + i * 8,
                speed: 0.12, color: '#ff0000', type: 'vortex1'
            });

            // Vórtice 2 (gira en dirección opuesta)
            this.obstacles.push({
                x: 550, y: 400, width: 14, height: 14,
                angle: -i * Math.PI / 3, radius: 60 + i * 10,
                speed: -0.1, color: '#ff0000', type: 'vortex2'
            });
        }

        // Obstáculos conectores entre vórtices
        for (let i = 0; i < 3; i++) {
            this.obstacles.push({
                x: 250 + i * 100, y: 200 + i * 67,
                width: 16, height: 16,
                speedX: 2 * (i % 2 === 0 ? 1 : -1),
                speedY: 1.5, color: '#ff0000'
            });
        }

        this.collectibles.push(
            { x: 400, y: 300, width: 8, height: 8, collected: false, color: '#0088ff' },
            { x: 200, y: 500, width: 8, height: 8, collected: false, color: '#0088ff' },
            { x: 600, y: 100, width: 8, height: 8, collected: false, color: '#0088ff' }
        );
    }

    // NIVEL 8: "El Corredor de la Muerte"
    createLevel8() {
        // Paredes de obstáculos que se mueven horizontalmente
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 3; j++) {
                this.obstacles.push({
                    x: -50 + i * 200, y: 100 + j * 150,
                    width: 30, height: 80,
                    speedX: 4 + i * 0.5, speedY: 0,
                    type: 'horizontal', color: '#ff0000'
                });
            }
        }

        // Obstáculos verticales que bajan
        for (let i = 0; i < 5; i++) {
            this.obstacles.push({
                x: 100 + i * 150, y: -50,
                width: 20, height: 100,
                speedX: 0, speedY: 3 + i * 0.3,
                type: 'vertical', color: '#ff0000'
            });
        }

        this.collectibles.push(
            { x: 125, y: 300, width: 8, height: 8, collected: false, color: '#0088ff' },
            { x: 375, y: 450, width: 8, height: 8, collected: false, color: '#0088ff' },
            { x: 625, y: 200, width: 8, height: 8, collected: false, color: '#0088ff' },
            { x: 250, y: 100, width: 8, height: 8, collected: false, color: '#0088ff' }
        );
    }

    // NIVEL 9: "La Galaxia Caótica"
    createLevel9() {
        // Sistema solar con múltiples órbitas
        const centers = [
            { x: 200, y: 150 }, { x: 600, y: 150 },
            { x: 200, y: 450 }, { x: 600, y: 450 },
            { x: 400, y: 300 }
        ];

        centers.forEach((center, centerIndex) => {
            for (let i = 0; i < 4; i++) {
                this.obstacles.push({
                    x: center.x, y: center.y, width: 12, height: 12,
                    angle: i * Math.PI / 2 + centerIndex,
                    radius: 40 + i * 15,
                    speed: 0.08 + centerIndex * 0.01 + i * 0.005,
                    color: '#ff0000', type: `galaxy${centerIndex}`
                });
            }
        });

        // Cometas que cruzan la galaxia
        for (let i = 0; i < 3; i++) {
            this.obstacles.push({
                x: Math.random() * this.width, y: Math.random() * this.height,
                width: 15, height: 15,
                speedX: (Math.random() - 0.5) * 8,
                speedY: (Math.random() - 0.5) * 8,
                type: 'comet', color: '#ff4444'
            });
        }

        this.collectibles.push(
            { x: 100, y: 100, width: 8, height: 8, collected: false, color: '#0088ff' },
            { x: 700, y: 100, width: 8, height: 8, collected: false, color: '#0088ff' },
            { x: 100, y: 500, width: 8, height: 8, collected: false, color: '#0088ff' },
            { x: 700, y: 500, width: 8, height: 8, collected: false, color: '#0088ff' },
            { x: 400, y: 50, width: 8, height: 8, collected: false, color: '#0088ff' }
        );
    }

    // NIVEL 10: "El Jefe Final - Parte 1"
    createLevel10() {
        // Patrón de jefe con múltiples fases

        // Anillo exterior giratorio
        for (let i = 0; i < 12; i++) {
            this.obstacles.push({
                x: 400, y: 300, width: 16, height: 16,
                angle: i * Math.PI / 6, radius: 150,
                speed: 0.05, color: '#ff0000', type: 'boss_ring'
            });
        }

        // Núcleo central pulsante
        for (let i = 0; i < 6; i++) {
            this.obstacles.push({
                x: 400, y: 300, width: 20, height: 20,
                angle: i * Math.PI / 3, radius: 50 + Math.sin(i) * 10,
                speed: -0.15, color: '#ff4444', type: 'boss_core'
            });
        }

        // Proyectiles que salen del centro
        for (let i = 0; i < 8; i++) {
            this.obstacles.push({
                x: 400, y: 300, width: 12, height: 12,
                speedX: Math.cos(i * Math.PI / 4) * 3,
                speedY: Math.sin(i * Math.PI / 4) * 3,
                type: 'projectile', color: '#ff6666'
            });
        }

        this.collectibles.push(
            { x: 100, y: 100, width: 10, height: 10, collected: false, color: '#0088ff' },
            { x: 700, y: 100, width: 10, height: 10, collected: false, color: '#0088ff' },
            { x: 100, y: 500, width: 10, height: 10, collected: false, color: '#0088ff' },
            { x: 700, y: 500, width: 10, height: 10, collected: false, color: '#0088ff' }
        );
    }

    // NIVEL 11: "El Túnel del Tiempo"
    createLevel11() {
        // Túnel con obstáculos que se acercan
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const distance = 200 + i * 30;

            this.obstacles.push({
                x: 400 + Math.cos(angle) * distance,
                y: 300 + Math.sin(angle) * distance,
                width: 15 + i, height: 15 + i,
                speedX: -Math.cos(angle) * 2,
                speedY: -Math.sin(angle) * 2,
                type: 'tunnel', color: '#ff0000'
            });
        }

        // Obstáculos que giran alrededor del túnel
        for (let i = 0; i < 6; i++) {
            this.obstacles.push({
                x: 400, y: 300, width: 18, height: 18,
                angle: i * Math.PI / 3, radius: 100,
                speed: 0.1, color: '#ff4444', type: 'tunnel_guard'
            });
        }

        this.collectibles.push(
            { x: 380, y: 280, width: 8, height: 8, collected: false, color: '#0088ff' },
            { x: 420, y: 320, width: 8, height: 8, collected: false, color: '#0088ff' },
            { x: 200, y: 300, width: 8, height: 8, collected: false, color: '#0088ff' }
        );
    }

    // NIVEL 12: "La Danza de los Elementos"
    createLevel12() {
        // Elemento Fuego - Obstáculos que explotan
        for (let i = 0; i < 4; i++) {
            this.obstacles.push({
                x: 150 + i * 150, y: 100,
                width: 20, height: 20,
                type: 'explosive', timer: i * 60,
                explosionRadius: 50, color: '#ff4400'
            });
        }

        // Elemento Agua - Obstáculos fluidos
        for (let i = 0; i < 8; i++) {
            this.obstacles.push({
                x: 100, y: 200 + i * 30, width: 15, height: 15,
                speedX: 2 + Math.sin(i) * 2, speedY: Math.cos(i) * 1,
                type: 'fluid', color: '#0044ff'
            });
        }

        // Elemento Aire - Obstáculos que flotan
        for (let i = 0; i < 6; i++) {
            this.obstacles.push({
                x: 300 + i * 80, y: 400,
                width: 16, height: 16,
                speedY: -1 - Math.sin(i * 0.5),
                type: 'floating', color: '#88ff88'
            });
        }

        this.collectibles.push(
            { x: 50, y: 50, width: 8, height: 8, collected: false, color: '#0088ff' },
            { x: 750, y: 50, width: 8, height: 8, collected: false, color: '#0088ff' },
            { x: 400, y: 550, width: 8, height: 8, collected: false, color: '#0088ff' },
            { x: 50, y: 550, width: 8, height: 8, collected: false, color: '#0088ff' },
            { x: 750, y: 550, width: 8, height: 8, collected: false, color: '#0088ff' }
        );
    }

    // NIVEL 13: "El Laberinto Cuántico"
    createLevel13() {
        // Obstáculos que se teletransportan
        for (let i = 0; i < 6; i++) {
            this.obstacles.push({
                x: Math.random() * 600 + 100,
                y: Math.random() * 400 + 100,
                width: 18, height: 18,
                type: 'quantum', teleportTimer: i * 30,
                teleportInterval: 180, color: '#ff00ff'
            });
        }

        // Portales cuánticos
        for (let i = 0; i < 4; i++) {
            this.obstacles.push({
                x: 200 + i * 150, y: 300,
                width: 30, height: 30,
                angle: 0, speed: 0.2,
                type: 'portal', color: '#8800ff'
            });
        }

        // Ondas cuánticas
        for (let i = 0; i < 10; i++) {
            this.obstacles.push({
                x: i * 80, y: 150 + Math.sin(i * 0.5) * 100,
                width: 12, height: 12,
                speedX: 1, speedY: Math.cos(i * 0.3),
                type: 'wave', color: '#ff4488'
            });
        }

        this.collectibles.push(
            { x: 100, y: 200, width: 8, height: 8, collected: false, color: '#0088ff' },
            { x: 700, y: 200, width: 8, height: 8, collected: false, color: '#0088ff' },
            { x: 400, y: 100, width: 8, height: 8, collected: false, color: '#0088ff' },
            { x: 400, y: 500, width: 8, height: 8, collected: false, color: '#0088ff' }
        );
    }

    // NIVEL 14: "El Apocalipsis Digital"
    createLevel14() {
        // Virus que se multiplican
        for (let i = 0; i < 3; i++) {
            this.obstacles.push({
                x: 200 + i * 200, y: 200 + i * 100,
                width: 20, height: 20,
                type: 'virus', multiplyTimer: 0,
                multiplyInterval: 300, color: '#ff0088'
            });
        }

        // Firewall - Barreras que se mueven
        for (let i = 0; i < 5; i++) {
            this.obstacles.push({
                x: 100 + i * 120, y: 50,
                width: 20, height: 500,
                speedY: 2 * (i % 2 === 0 ? 1 : -1),
                type: 'firewall', color: '#00ff88'
            });
        }

        // Datos corruptos - Obstáculos glitcheados
        for (let i = 0; i < 8; i++) {
            this.obstacles.push({
                x: Math.random() * 700 + 50,
                y: Math.random() * 500 + 50,
                width: 15 + Math.random() * 10,
                height: 15 + Math.random() * 10,
                speedX: (Math.random() - 0.5) * 6,
                speedY: (Math.random() - 0.5) * 6,
                type: 'corrupt', color: '#ff8800'
            });
        }

        this.collectibles.push(
            { x: 50, y: 300, width: 8, height: 8, collected: false, color: '#0088ff' },
            { x: 750, y: 300, width: 8, height: 8, collected: false, color: '#0088ff' },
            { x: 400, y: 50, width: 8, height: 8, collected: false, color: '#0088ff' },
            { x: 400, y: 550, width: 8, height: 8, collected: false, color: '#0088ff' },
            { x: 200, y: 400, width: 8, height: 8, collected: false, color: '#0088ff' },
            { x: 600, y: 200, width: 8, height: 8, collected: false, color: '#0088ff' }
        );
    }

    // NIVEL 15: "El Jefe Final - Forma Definitiva"
    createLevel15() {
        // Jefe final con múltiples ataques

        // Núcleo principal
        this.obstacles.push({
            x: 400, y: 300, width: 40, height: 40,
            type: 'final_boss', health: 100,
            phase: 1, color: '#ff0000'
        });

        // Anillos de protección múltiples
        for (let ring = 0; ring < 3; ring++) {
            for (let i = 0; i < 8; i++) {
                this.obstacles.push({
                    x: 400, y: 300, width: 14, height: 14,
                    angle: i * Math.PI / 4 + ring * 0.5,
                    radius: 80 + ring * 40,
                    speed: 0.08 * (ring % 2 === 0 ? 1 : -1),
                    type: `boss_ring_${ring}`, color: '#ff2222'
                });
            }
        }

        // Torretas satelitales
        for (let i = 0; i < 4; i++) {
            const angle = i * Math.PI / 2;
            this.obstacles.push({
                x: 400 + Math.cos(angle) * 200,
                y: 300 + Math.sin(angle) * 200,
                width: 25, height: 25,
                type: 'turret', shootTimer: i * 30,
                shootInterval: 120, color: '#ff4444'
            });
        }

        // Proyectiles del jefe
        for (let i = 0; i < 16; i++) {
            const angle = i * Math.PI / 8;
            this.obstacles.push({
                x: 400, y: 300, width: 10, height: 10,
                speedX: Math.cos(angle) * 4,
                speedY: Math.sin(angle) * 4,
                type: 'boss_projectile', color: '#ff6666'
            });
        }

        // Coleccionables especiales del jefe final
        this.collectibles.push(
            { x: 100, y: 100, width: 12, height: 12, collected: false, color: '#00ffff' },
            { x: 700, y: 100, width: 12, height: 12, collected: false, color: '#00ffff' },
            { x: 100, y: 500, width: 12, height: 12, collected: false, color: '#00ffff' },
            { x: 700, y: 500, width: 12, height: 12, collected: false, color: '#00ffff' },
            { x: 50, y: 300, width: 12, height: 12, collected: false, color: '#00ffff' },
            { x: 750, y: 300, width: 12, height: 12, collected: false, color: '#00ffff' },
            { x: 400, y: 50, width: 12, height: 12, collected: false, color: '#00ffff' }
        );
    }

    createRandomLevel() {
        const difficultyMultiplier = 1 + (this.level - 16) * 0.3;
        const numObstacles = 8 + this.level * 2;

        for (let i = 0; i < numObstacles; i++) {
            this.obstacles.push({
                x: Math.random() * (this.width - 120) + 60,
                y: Math.random() * (this.height - 120) + 60,
                width: 14 + Math.random() * 8,
                height: 14 + Math.random() * 8,
                speedX: (Math.random() - 0.5) * 10 * difficultyMultiplier,
                speedY: (Math.random() - 0.5) * 10 * difficultyMultiplier,
                color: '#ff0000'
            });
        }

        const numCollectibles = Math.min(6, Math.floor(this.level / 2) + 2);
        for (let i = 0; i < numCollectibles; i++) {
            this.collectibles.push({
                x: Math.random() * (this.width - 250) + 125,
                y: Math.random() * (this.height - 150) + 75,
                width: Math.max(6, 10 - Math.floor(this.level / 4)),
                height: Math.max(6, 10 - Math.floor(this.level / 4)),
                collected: false,
                color: '#0088ff'
            });
        }
    }

    update() {
        if (this.gameOver || this.paused) return;

        this.time += 0.016;
        this.updateEffects();
        this.updatePlayer();
        this.updatePlayerTrail();
        this.updateObstacles();
        this.updatePowerUps();
        this.updateParticles();
        this.updateFloatingTexts();
        this.checkCollisions();
        this.checkWinCondition();
        this.updateUI();
    }

    updateEffects() {
        this.screenShake *= 0.9;
        this.flashEffect *= 0.95;
        this.player.glowIntensity = Math.sin(this.time * 8) * 0.3 + 0.7;
        this.player.bounceOffset = Math.sin(this.time * 12) * 2;
    }

    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= particle.decay || 0.02;
            particle.size *= 0.98;
            return particle.life > 0 && particle.size > 0.5;
        });

        if (Math.random() < 0.3) {
            this.particles.push({
                x: this.player.x + this.player.width / 2,
                y: this.player.y + this.player.height / 2,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * 4 + 2,
                life: 1,
                color: `hsl(120, 100%, ${50 + Math.random() * 50}%)`
            });
        }
    }

    updatePlayer() {
        let newX = this.player.x;
        let newY = this.player.y;

        const isHyperSpeed = this.keys[' '] || this.keys['space'];
        const currentSpeed = (isHyperSpeed ? this.player.hyperSpeed : this.player.speed) * this.speedMultiplier;

        if (this.gestureController.currentPointingVector && this.gestureEnabled) {
            const vector = this.gestureController.currentPointingVector;
            const speedMultiplier = isHyperSpeed ? 2.5 : 1.5;
            newX += vector.x * currentSpeed * speedMultiplier;
            newY += vector.y * currentSpeed * speedMultiplier;
        } else {
            const activeKeys = { ...this.keys, ...this.gestureKeys };

            if (activeKeys['w'] || activeKeys['arrowup']) {
                newY -= currentSpeed;
            }
            if (activeKeys['s'] || activeKeys['arrowdown']) {
                newY += currentSpeed;
            }
            if (activeKeys['a'] || activeKeys['arrowleft']) {
                newX -= currentSpeed;
            }
            if (activeKeys['d'] || activeKeys['arrowright']) {
                newX += currentSpeed;
            }
        }

        if (newX >= 0 && newX <= this.width - this.player.width) {
            this.player.x = newX;
        }
        if (newY >= 0 && newY <= this.height - this.player.height) {
            this.player.y = newY;
        }
    }

    updatePlayerTrail() {
        this.player.trail.push({
            x: this.player.x + this.player.width / 2,
            y: this.player.y + this.player.height / 2,
            life: 1
        });

        this.player.trail = this.player.trail.filter(point => {
            point.life -= 0.05;
            return point.life > 0;
        });

        if (this.player.trail.length > 20) {
            this.player.trail.shift();
        }
    }

    updateObstacles() {
        this.obstacles.forEach(obstacle => {
            const timeMultiplier = this.timeMultiplier || 1;

            // Handle different obstacle types
            switch (obstacle.type) {
                case 'movingWall':
                    obstacle.y += obstacle.speedY * timeMultiplier;
                    if (obstacle.y <= obstacle.minY || obstacle.y >= obstacle.maxY) {
                        obstacle.speedY *= -1;
                    }
                    obstacle.y = Math.max(obstacle.minY, Math.min(obstacle.maxY, obstacle.y));
                    break;

                case 'horizontal':
                    obstacle.x += obstacle.speedX * timeMultiplier;
                    if (obstacle.speedX > 0 && obstacle.x > this.width + 50) {
                        obstacle.x = -50;
                    } else if (obstacle.speedX < 0 && obstacle.x < -50) {
                        obstacle.x = this.width + 50;
                    }
                    break;

                case 'vertical':
                    obstacle.y += obstacle.speedY * timeMultiplier;
                    if (obstacle.y > this.height + 50) {
                        obstacle.y = -50;
                    }
                    break;

                case 'blinking':
                    obstacle.blinkTimer++;
                    if (obstacle.blinkTimer >= obstacle.blinkInterval) {
                        obstacle.visible = !obstacle.visible;
                        obstacle.blinkTimer = 0;
                    }
                    break;

                case 'follower':
                    const dx = this.player.x - obstacle.x;
                    const dy = this.player.y - obstacle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance > 0) {
                        obstacle.x += (dx / distance) * obstacle.speed * timeMultiplier;
                        obstacle.y += (dy / distance) * obstacle.speed * timeMultiplier;
                    }
                    break;

                case 'zigzag':
                    obstacle.x += obstacle.speedX * timeMultiplier;
                    obstacle.y += obstacle.speedY * obstacle.direction * timeMultiplier;
                    if (obstacle.y <= 50 || obstacle.y >= this.height - 50) {
                        obstacle.direction *= -1;
                    }
                    if (obstacle.x <= 0 || obstacle.x >= this.width - obstacle.width) {
                        obstacle.speedX *= -1;
                    }
                    break;

                case 'quantum':
                    obstacle.teleportTimer++;
                    if (obstacle.teleportTimer >= obstacle.teleportInterval) {
                        obstacle.x = Math.random() * (this.width - obstacle.width);
                        obstacle.y = Math.random() * (this.height - obstacle.height);
                        obstacle.teleportTimer = 0;
                    }
                    break;

                default:
                    // Handle circular/orbital obstacles
                    if (obstacle.angle !== undefined) {
                        obstacle.angle += obstacle.speed * timeMultiplier;

                        // Determine center based on type
                        let centerX = 350, centerY = 300;
                        if (obstacle.type === 'vortex1') {
                            centerX = 250; centerY = 200;
                        } else if (obstacle.type === 'vortex2') {
                            centerX = 550; centerY = 400;
                        } else if (obstacle.type && obstacle.type.startsWith('galaxy')) {
                            const centers = [
                                { x: 200, y: 150 }, { x: 600, y: 150 },
                                { x: 200, y: 450 }, { x: 600, y: 450 },
                                { x: 400, y: 300 }
                            ];
                            const centerIndex = parseInt(obstacle.type.replace('galaxy', ''));
                            if (centers[centerIndex]) {
                                centerX = centers[centerIndex].x;
                                centerY = centers[centerIndex].y;
                            }
                        }

                        obstacle.x = centerX + Math.cos(obstacle.angle) * obstacle.radius - obstacle.width / 2;
                        obstacle.y = centerY + Math.sin(obstacle.angle) * obstacle.radius - obstacle.height / 2;
                    } else {
                        // Standard linear movement
                        obstacle.x += (obstacle.speedX || 0) * timeMultiplier;
                        obstacle.y += (obstacle.speedY || 0) * timeMultiplier;

                        // Bounce off walls for standard obstacles
                        if (obstacle.x <= 0 || obstacle.x >= this.width - obstacle.width) {
                            obstacle.speedX *= -1;
                        }
                        if (obstacle.y <= 0 || obstacle.y >= this.height - obstacle.height) {
                            obstacle.speedY *= -1;
                        }
                    }
                    break;
            }
        });
    }

    checkCollisions() {
        // Check obstacle collisions
        this.obstacles.forEach(obstacle => {
            if (this.isColliding(this.player, obstacle)) {
                if (!this.powerUpEffects.shield.active) {
                    this.playerDied();
                }
            }
        });

        // Check collectible collisions
        this.collectibles.forEach(collectible => {
            if (!collectible.collected && this.isColliding(this.player, collectible)) {
                collectible.collected = true;
                this.collectItem();
            }
        });

        // Check power-up collisions
        this.powerUps.forEach(powerUp => {
            if (!powerUp.collected && this.isColliding(this.player, powerUp)) {
                this.collectPowerUp(powerUp);
            }
        });
    }

    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y;
    }

    collectItem() {
        this.playCollectSound();

        this.combo++;
        const basePoints = 100;
        const comboBonus = this.combo * 10;
        const speedBonus = this.speedMultiplier > 1 ? 50 : 0;
        const points = (basePoints + comboBonus + speedBonus) * this.multiplier;

        this.score += points;
        this.showFloatingText(`+${points}`, this.player.x, this.player.y - 20, '#00ff88');

        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: this.player.x + this.player.width / 2,
                y: this.player.y + this.player.height / 2,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 1,
                decay: 0.02,
                color: '#0088ff',
                size: Math.random() * 3 + 1
            });
        }
    }

    playerDied() {
        this.deaths++;
        this.combo = 0; // Reset combo on death
        this.playCollisionSound();
        this.screenShake = 15;
        this.flashEffect = 1;

        // Reset player position
        this.player.x = 50;
        this.player.y = 300;

        // Death particles
        for (let i = 0; i < 30; i++) {
            this.particles.push({
                x: this.player.x + this.player.width / 2,
                y: this.player.y + this.player.height / 2,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1,
                decay: 0.015,
                color: '#ff0000',
                size: Math.random() * 5 + 2
            });
        }
    }

    checkWinCondition() {
        const allCollected = this.collectibles.every(c => c.collected);

        if (allCollected && this.isColliding(this.player, this.goal)) {
            const completionTime = Math.floor((Date.now() - this.startTime) / 1000);
            this.saveProgress(this.level, completionTime, this.deaths);

            this.level++;
            if (this.level > this.maxLevels) {
                this.levelCompleted(completionTime);
            } else {
                this.initLevel();
            }
        }
    }

    levelCompleted(completionTime) {
        this.gameOver = true;

        document.getElementById('completionTime').textContent = completionTime;
        document.getElementById('totalDeaths').textContent = this.deaths;

        const bestTime = this.levelProgress[this.level - 1]?.bestTime;
        if (!bestTime || completionTime < bestTime) {
            document.getElementById('newRecord').style.display = 'block';
        }

        document.getElementById('gameOver').style.display = 'block';
        this.playVictorySound();
    }

    saveProgress(level, time, deaths) {
        if (!this.levelProgress[level]) {
            this.levelProgress[level] = {
                completed: true,
                bestTime: time,
                totalDeaths: deaths,
                attempts: 1
            };
        } else {
            const progress = this.levelProgress[level];
            progress.completed = true;
            progress.attempts++;
            if (time < progress.bestTime) {
                progress.bestTime = time;
            }
            progress.totalDeaths += deaths;
        }

        localStorage.setItem('gameProgress', JSON.stringify(this.levelProgress));
    }

    loadProgress() {
        const saved = localStorage.getItem('gameProgress');
        return saved ? JSON.parse(saved) : {};
    }

    restart() {
        this.gameOver = false;
        this.deaths = 0;
        this.score = 0;
        this.combo = 0;
        this.startTime = Date.now();
        this.initLevel();
        document.getElementById('gameOver').style.display = 'none';
    }

    updateUI() {
        document.getElementById('level').textContent = this.level;
        document.getElementById('deaths').textContent = this.deaths;

        // Check if score element exists before updating
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = this.score.toLocaleString();
        }

        const comboElement = document.getElementById('combo');
        if (comboElement) {
            comboElement.textContent = this.combo;
        }

        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        document.getElementById('time').textContent = elapsed;

        this.updatePowerUpUI();
    }

    updatePowerUpUI() {
        const powerUpStatus = document.getElementById('powerUpStatus');
        if (!powerUpStatus) return;

        let anyActive = false;

        Object.keys(this.powerUpEffects).forEach(key => {
            const effect = this.powerUpEffects[key];
            const statusElement = document.getElementById(`${key}Status`);
            const timeElement = document.getElementById(`${key}Time`);

            if (statusElement && timeElement) {
                if (effect.active) {
                    anyActive = true;
                    statusElement.style.display = 'block';
                    const remainingTime = Math.ceil(effect.duration / 1000);
                    timeElement.textContent = remainingTime;
                } else {
                    statusElement.style.display = 'none';
                }
            }
        });

        powerUpStatus.style.display = anyActive ? 'block' : 'none';
    }

    render() {
        // Clear canvas with shake effect
        const shakeX = (Math.random() - 0.5) * this.screenShake;
        const shakeY = (Math.random() - 0.5) * this.screenShake;

        this.ctx.save();
        this.ctx.translate(shakeX, shakeY);

        // Background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#0a0a0a');
        gradient.addColorStop(0.5, '#1a1a1a');
        gradient.addColorStop(1, '#0f0f0f');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Background pattern
        if (this.backgroundPattern) {
            this.ctx.fillStyle = this.backgroundPattern;
            this.ctx.fillRect(0, 0, this.width, this.height);
        }

        // Flash effect
        if (this.flashEffect > 0) {
            this.ctx.fillStyle = `rgba(255, 0, 0, ${this.flashEffect * 0.3})`;
            this.ctx.fillRect(0, 0, this.width, this.height);
        }

        // Render player trail
        this.player.trail.forEach((point, index) => {
            const alpha = point.life * 0.5;
            this.ctx.fillStyle = `rgba(0, 255, 136, ${alpha})`;
            this.ctx.fillRect(point.x - 2, point.y - 2, 4, 4);
        });

        // Render player
        this.renderPlayer();

        // Render obstacles
        this.obstacles.forEach(obstacle => this.renderObstacle(obstacle));

        // Render collectibles
        this.collectibles.forEach(collectible => {
            if (!collectible.collected) {
                this.renderCollectible(collectible);
            }
        });

        // Render power-ups
        this.powerUps.forEach(powerUp => {
            if (!powerUp.collected) {
                this.renderPowerUp(powerUp);
            }
        });

        // Render goal
        this.renderGoal();

        // Render particles
        this.particles.forEach(particle => this.renderParticle(particle));

        // Render floating texts
        this.floatingTexts.forEach(text => this.renderFloatingText(text));

        // Render pause overlay
        if (this.paused) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.width, this.height);

            this.ctx.fillStyle = '#fff';
            this.ctx.font = '48px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSADO', this.width / 2, this.height / 2);

            this.ctx.font = '16px Courier New';
            this.ctx.fillText('Mano abierta para continuar', this.width / 2, this.height / 2 + 40);
        }

        this.ctx.restore();
    }

    renderPlayer() {
        const x = this.player.x;
        const y = this.player.y + this.player.bounceOffset;

        this.ctx.save();

        // Shield effect
        if (this.powerUpEffects.shield.active) {
            this.ctx.strokeStyle = '#00ffff';
            this.ctx.lineWidth = 3;
            this.ctx.setLineDash([5, 5]);
            this.ctx.beginPath();
            this.ctx.arc(x + this.player.width / 2, y + this.player.height / 2,
                this.player.width / 2 + 8 + Math.sin(this.time * 10) * 3, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }

        // Glow effect based on power-ups
        let glowColor = '#00ff88';
        let glowIntensity = 15;

        if (this.powerUpEffects.speed.active) {
            glowColor = '#ff8800';
            glowIntensity = 25;
        } else if (this.powerUpEffects.slowMotion.active) {
            glowColor = '#8800ff';
            glowIntensity = 20;
        }

        this.ctx.shadowBlur = glowIntensity * this.player.glowIntensity;
        this.ctx.shadowColor = glowColor;

        if (this.imageLoaded && this.tonyImage) {
            // Draw Tony image with effects
            this.ctx.drawImage(
                this.tonyImage,
                x, y,
                this.player.width, this.player.height
            );

            // Add glow border around Tony
            this.ctx.strokeStyle = glowColor;
            this.ctx.lineWidth = 2;
            this.ctx.globalAlpha = this.player.glowIntensity * 0.7;
            this.ctx.strokeRect(x, y, this.player.width, this.player.height);
            this.ctx.globalAlpha = 1;
        } else {
            // Fallback to gradient rectangle if image not loaded
            const playerGradient = this.ctx.createRadialGradient(
                x + this.player.width / 2, y + this.player.height / 2, 0,
                x + this.player.width / 2, y + this.player.height / 2, this.player.width
            );

            if (this.powerUpEffects.speed.active) {
                playerGradient.addColorStop(0, '#ff8800');
                playerGradient.addColorStop(0.7, '#ff6600');
                playerGradient.addColorStop(1, '#cc4400');
            } else if (this.powerUpEffects.slowMotion.active) {
                playerGradient.addColorStop(0, '#8800ff');
                playerGradient.addColorStop(0.7, '#6600cc');
                playerGradient.addColorStop(1, '#440088');
            } else {
                playerGradient.addColorStop(0, '#00ff88');
                playerGradient.addColorStop(0.7, '#00cc66');
                playerGradient.addColorStop(1, '#008844');
            }

            this.ctx.fillStyle = playerGradient;
            this.ctx.fillRect(x, y, this.player.width, this.player.height);
        }

        this.ctx.restore();
    }

    renderObstacle(obstacle) {
        // Skip rendering if obstacle is blinking and not visible
        if (obstacle.type === 'blinking' && !obstacle.visible) {
            return;
        }

        this.ctx.save();

        // Different visual effects based on obstacle type
        let shadowColor = '#ff3333';
        let shadowBlur = 15;

        switch (obstacle.type) {
            case 'follower':
                shadowColor = '#ff6666';
                shadowBlur = 20;
                break;
            case 'blinking':
                shadowColor = '#ff4444';
                shadowBlur = 25;
                break;
            case 'quantum':
                shadowColor = '#ff00ff';
                shadowBlur = 30;
                break;
            case 'virus':
                shadowColor = '#ff0088';
                shadowBlur = 18;
                break;
            case 'firewall':
                shadowColor = '#00ff88';
                shadowBlur = 12;
                break;
            default:
                shadowColor = '#ff3333';
                shadowBlur = 15;
        }

        this.ctx.shadowBlur = shadowBlur;
        this.ctx.shadowColor = shadowColor;

        // Create gradient based on obstacle type
        const obstacleGradient = this.ctx.createRadialGradient(
            obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2, 0,
            obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2, obstacle.width
        );

        // Different colors for different obstacle types
        switch (obstacle.type) {
            case 'follower':
                obstacleGradient.addColorStop(0, '#ff8888');
                obstacleGradient.addColorStop(0.7, '#ff6666');
                obstacleGradient.addColorStop(1, '#cc4444');
                break;
            case 'blinking':
                const alpha = Math.sin(this.time * 10) * 0.3 + 0.7;
                obstacleGradient.addColorStop(0, `rgba(255, 68, 68, ${alpha})`);
                obstacleGradient.addColorStop(0.7, `rgba(255, 34, 34, ${alpha})`);
                obstacleGradient.addColorStop(1, `rgba(204, 0, 0, ${alpha})`);
                break;
            case 'quantum':
                obstacleGradient.addColorStop(0, '#ff88ff');
                obstacleGradient.addColorStop(0.7, '#ff00ff');
                obstacleGradient.addColorStop(1, '#cc00cc');
                break;
            case 'virus':
                obstacleGradient.addColorStop(0, '#ff4488');
                obstacleGradient.addColorStop(0.7, '#ff0088');
                obstacleGradient.addColorStop(1, '#cc0066');
                break;
            case 'firewall':
                obstacleGradient.addColorStop(0, '#44ff88');
                obstacleGradient.addColorStop(0.7, '#00ff88');
                obstacleGradient.addColorStop(1, '#00cc66');
                break;
            default:
                obstacleGradient.addColorStop(0, '#ff6666');
                obstacleGradient.addColorStop(0.7, '#ff3333');
                obstacleGradient.addColorStop(1, '#cc0000');
        }

        this.ctx.fillStyle = obstacleGradient;
        this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

        // Add special effects for certain obstacle types
        if (obstacle.type === 'quantum') {
            // Quantum shimmer effect
            this.ctx.strokeStyle = '#ff00ff';
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([5, 5]);
            this.ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            this.ctx.setLineDash([]);
        }

        if (obstacle.type === 'final_boss') {
            // Boss special rendering
            this.ctx.strokeStyle = '#ffff00';
            this.ctx.lineWidth = 4;
            this.ctx.strokeRect(obstacle.x - 2, obstacle.y - 2, obstacle.width + 4, obstacle.height + 4);

            // Boss health indicator
            const healthPercent = (obstacle.health || 100) / 100;
            this.ctx.fillStyle = '#ff0000';
            this.ctx.fillRect(obstacle.x, obstacle.y - 10, obstacle.width, 4);
            this.ctx.fillStyle = '#00ff00';
            this.ctx.fillRect(obstacle.x, obstacle.y - 10, obstacle.width * healthPercent, 4);
        }

        this.ctx.restore();
    }

    renderCollectible(collectible) {
        const pulseSize = Math.sin(this.time * 6) * 2;
        const y = collectible.y + Math.sin(this.time * 4 + collectible.x * 0.01) * 3;

        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#0088ff';

        const collectibleGradient = this.ctx.createRadialGradient(
            collectible.x + collectible.width / 2, y + collectible.height / 2, 0,
            collectible.x + collectible.width / 2, y + collectible.height / 2, collectible.width
        );
        collectibleGradient.addColorStop(0, '#66ccff');
        collectibleGradient.addColorStop(0.7, '#0088ff');
        collectibleGradient.addColorStop(1, '#0066cc');

        this.ctx.fillStyle = collectibleGradient;
        this.ctx.beginPath();
        this.ctx.arc(
            collectible.x + collectible.width / 2,
            y + collectible.height / 2,
            collectible.width / 2 + pulseSize,
            0, Math.PI * 2
        );
        this.ctx.fill();

        this.ctx.shadowBlur = 0;
    }

    renderPowerUp(powerUp) {
        const pulseSize = Math.sin(powerUp.pulseTime) * 3;
        const y = powerUp.y + Math.sin(this.time * 3 + powerUp.x * 0.02) * 4;

        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = powerUp.color;

        this.ctx.fillStyle = powerUp.color;
        this.ctx.fillRect(
            powerUp.x - pulseSize / 2,
            y - pulseSize / 2,
            powerUp.width + pulseSize,
            powerUp.height + pulseSize
        );

        // Power-up icon
        this.ctx.fillStyle = '#000';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        let icon = '';
        switch (powerUp.type) {
            case 'shield': icon = '🛡️'; break;
            case 'speed': icon = '🚀'; break;
            case 'slowMotion': icon = '⏰'; break;
        }
        this.ctx.fillText(icon, powerUp.x + powerUp.width / 2, y + powerUp.height / 2 + 4);

        this.ctx.shadowBlur = 0;
    }

    renderGoal() {
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#ffff00';

        const goalGradient = this.ctx.createLinearGradient(
            this.goal.x, this.goal.y,
            this.goal.x + this.goal.width, this.goal.y + this.goal.height
        );
        goalGradient.addColorStop(0, '#ffff88');
        goalGradient.addColorStop(0.5, '#ffff00');
        goalGradient.addColorStop(1, '#cccc00');

        this.ctx.fillStyle = goalGradient;
        this.ctx.fillRect(this.goal.x, this.goal.y, this.goal.width, this.goal.height);

        this.ctx.shadowBlur = 0;
    }

    renderParticle(particle) {
        this.ctx.fillStyle = particle.color;
        this.ctx.globalAlpha = particle.life;
        this.ctx.fillRect(particle.x - particle.size / 2, particle.y - particle.size / 2,
            particle.size, particle.size);
        this.ctx.globalAlpha = 1;
    }

    renderFloatingText(text) {
        this.ctx.fillStyle = text.color;
        this.ctx.font = `${text.size}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.globalAlpha = text.life;
        this.ctx.fillText(text.text, text.x, text.y);
        this.ctx.globalAlpha = 1;
    }

    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Settings Manager
class SettingsManager {
    constructor() {
        this.settings = this.loadSettings();
        this.applySettings();
    }

    loadSettings() {
        const defaultSettings = {
            soundEnabled: true,
            volume: 50,
            sfxEnabled: true,
            controlMode: 'hybrid',
            gestureIndicators: true,
            gestureSensitivity: 5,
            touchSensitivity: 5,
            theme: 'dark',
            visualEffects: true,
            showFPS: false,
            difficulty: 'normal',
            hyperSpeed: 8,
            autoSave: true,
            missionNotifications: true
        };

        const saved = localStorage.getItem('gameSettings');
        if (saved) {
            return { ...defaultSettings, ...JSON.parse(saved) };
        }
        return defaultSettings;
    }

    saveSettings() {
        localStorage.setItem('gameSettings', JSON.stringify(this.settings));
    }

    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
        this.applySettings();
    }

    applySettings() {
        document.body.className = `theme-${this.settings.theme}`;

        if (window.game) {
            window.game.soundEnabled = this.settings.soundEnabled;
            window.game.sfxEnabled = this.settings.sfxEnabled;
            window.game.masterVolume = this.settings.volume / 100;
            window.game.player.hyperSpeed = this.settings.hyperSpeed;
            window.game.showFPS = this.settings.showFPS;
            window.game.visualEffectsEnabled = this.settings.visualEffects;
        }
    }

    resetToDefaults() {
        this.settings = {
            soundEnabled: true,
            volume: 50,
            sfxEnabled: true,
            controlMode: 'hybrid',
            gestureIndicators: true,
            gestureSensitivity: 5,
            touchSensitivity: 5,
            theme: 'dark',
            visualEffects: true,
            showFPS: false,
            difficulty: 'normal',
            hyperSpeed: 8,
            autoSave: true,
            missionNotifications: true
        };
        this.saveSettings();
        this.applySettings();
        this.updateUI();
    }

    updateUI() {
        // Update toggles
        this.updateToggle('soundToggle', this.settings.soundEnabled);
        this.updateToggle('sfxToggle', this.settings.sfxEnabled);
        this.updateToggle('gestureIndicatorToggle', this.settings.gestureIndicators);
        this.updateToggle('effectsToggle', this.settings.visualEffects);
        this.updateToggle('fpsToggle', this.settings.showFPS);
        this.updateToggle('autoSaveToggle', this.settings.autoSave);
        this.updateToggle('missionNotificationsToggle', this.settings.missionNotifications);

        // Update sliders
        document.getElementById('volumeSlider').value = this.settings.volume;
        document.getElementById('volumeValue').textContent = this.settings.volume + '%';
        document.getElementById('sensitivitySlider').value = this.settings.gestureSensitivity;
        document.getElementById('sensitivityValue').textContent = this.settings.gestureSensitivity;
        document.getElementById('touchSensitivitySlider').value = this.settings.touchSensitivity;
        document.getElementById('touchSensitivityValue').textContent = this.settings.touchSensitivity;
        document.getElementById('hyperSpeedSlider').value = this.settings.hyperSpeed;
        document.getElementById('hyperSpeedValue').textContent = this.settings.hyperSpeed + 'x';

        // Update selects
        document.getElementById('controlModeSelect').value = this.settings.controlMode;
        document.getElementById('difficultySelect').value = this.settings.difficulty;

        // Update theme
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('active');
            if (option.dataset.theme === this.settings.theme) {
                option.classList.add('active');
            }
        });
    }

    updateToggle(toggleId, isActive) {
        const toggle = document.getElementById(toggleId);
        if (toggle) {
            if (isActive) {
                toggle.classList.add('active');
            } else {
                toggle.classList.remove('active');
            }
        }
    }
}

// Mission System
class MissionSystem {
    constructor() {
        this.missions = this.getDefaultMissions();
        this.progress = this.loadProgress();
    }

    getDefaultMissions() {
        return [
            {
                id: 'first_level',
                title: 'Primer Paso',
                description: 'Completa el primer nivel',
                reward: 100,
                type: 'level_complete',
                target: 1,
                completed: false
            },
            {
                id: 'speed_demon',
                title: 'Demonio de Velocidad',
                description: 'Completa un nivel en menos de 30 segundos',
                reward: 250,
                type: 'time_challenge',
                target: 30,
                completed: false
            },
            {
                id: 'survivor',
                title: 'Superviviente',
                description: 'Completa un nivel sin morir',
                reward: 200,
                type: 'no_deaths',
                target: 0,
                completed: false
            },
            {
                id: 'collector',
                title: 'Coleccionista',
                description: 'Recolecta 50 objetos en total',
                reward: 150,
                type: 'collect_items',
                target: 50,
                completed: false
            },
            {
                id: 'level_5',
                title: 'Medio Camino',
                description: 'Alcanza el nivel 5',
                reward: 300,
                type: 'level_reach',
                target: 5,
                completed: false
            }
        ];
    }

    loadProgress() {
        const saved = localStorage.getItem('missionProgress');
        return saved ? JSON.parse(saved) : {};
    }

    saveProgress() {
        localStorage.setItem('missionProgress', JSON.stringify(this.progress));
    }

    updateMissionsDisplay() {
        const container = document.getElementById('missionsList');
        if (!container) return;

        container.innerHTML = '';

        this.missions.forEach(mission => {
            const progress = this.progress[mission.id] || { current: 0, completed: false };
            const missionElement = document.createElement('div');
            missionElement.className = `mission-item ${progress.completed ? 'completed' : 'active'}`;

            const progressPercent = Math.min(100, (progress.current / mission.target) * 100);

            missionElement.innerHTML = `
                <div class="mission-header">
                    <div class="mission-title">${mission.title}</div>
                    <div class="mission-reward">+${mission.reward}</div>
                </div>
                <div class="mission-description">${mission.description}</div>
                <div class="mission-progress">
                    <div class="mission-progress-bar">
                        <div class="mission-progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                    <div class="mission-progress-text">${progress.current}/${mission.target}</div>
                </div>
            `;

            container.appendChild(missionElement);
        });

        this.updateMissionsStats();
    }

    updateMissionsStats() {
        const completed = this.missions.filter(m => this.progress[m.id]?.completed).length;
        const total = this.missions.length;
        const totalRewards = this.missions
            .filter(m => this.progress[m.id]?.completed)
            .reduce((sum, m) => sum + m.reward, 0);

        document.getElementById('completedMissions').textContent = `${completed}/${total}`;
        document.getElementById('missionPoints').textContent = totalRewards;

        let rank = 'Novato';
        if (completed >= 4) rank = 'Experto';
        else if (completed >= 2) rank = 'Intermedio';

        document.getElementById('currentRank').textContent = rank;
    }

    resetAllMissions() {
        this.progress = {};
        this.saveProgress();
        this.updateMissionsDisplay();
    }
}

// Global instances
let settingsManager;
let missionSystem;
let game;

// Game initialization and control functions
async function startCamera() {
    document.getElementById('cameraPermission').style.display = 'none';

    game = new Game();
    window.game = game;

    const gesturesEnabled = await game.enableGestures();

    if (!gesturesEnabled) {
        alert('No se pudo activar la cámara. Puedes jugar con el teclado (WASD o flechas).');
    }
}

function playWithoutCamera() {
    document.getElementById('cameraPermission').style.display = 'none';
    game = new Game();
    window.game = game;
}

// Level Menu Functions
function showLevelMenu() {
    if (!window.game) return;

    generateLevelMenu();
    document.getElementById('levelMenu').style.display = 'block';
    document.getElementById('gameContainer').style.display = 'none';
    document.getElementById('settingsMenu').style.display = 'none';
    document.getElementById('missionsMenu').style.display = 'none';
}

function generateLevelMenu() {
    const levelGrid = document.getElementById('levelGrid');
    levelGrid.innerHTML = '';

    for (let i = 1; i <= 15; i++) {
        const levelData = window.game.levelProgress[i] || { completed: false, bestTime: null };
        const levelCard = document.createElement('div');
        levelCard.className = 'level-card';

        const isUnlocked = i === 1 || window.game.levelProgress[i - 1]?.completed;

        if (!isUnlocked) {
            levelCard.classList.add('locked');
            levelCard.innerHTML = `
                <div class="level-number">🔒</div>
                <div class="level-status">Bloqueado</div>
            `;
        } else if (levelData.completed) {
            levelCard.classList.add('completed');
            levelCard.innerHTML = `
                <div class="level-number">${i}</div>
                <div class="level-status">✅ Completado</div>
                <div class="level-time">${levelData.bestTime || '--'}s</div>
            `;
            levelCard.onclick = () => selectLevel(i);
        } else {
            levelCard.classList.add('unlocked');
            levelCard.innerHTML = `
                <div class="level-number">${i}</div>
                <div class="level-status">Disponible</div>
            `;
            levelCard.onclick = () => selectLevel(i);
        }

        if (i === window.game.level) {
            levelCard.classList.add('current');
        }

        levelGrid.appendChild(levelCard);
    }
}

function selectLevel(levelNumber) {
    if (window.game) {
        window.game.level = levelNumber;

        // Update visual indicator
        document.querySelectorAll('.level-card').forEach(card => {
            card.classList.remove('current');
        });
        document.querySelectorAll('.level-card')[levelNumber - 1].classList.add('current');

        updateLevelInfo();
    }
}

function updateLevelInfo() {
    if (!window.game) return;

    document.getElementById('currentLevel').textContent = window.game.level;
    const levelData = window.game.levelProgress[window.game.level];
    const bestTime = levelData?.bestTime ? `${levelData.bestTime}s` : '--';
    document.getElementById('bestTime').textContent = bestTime;
}

function showGame() {
    document.getElementById('levelMenu').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';
    document.getElementById('settingsMenu').style.display = 'none';
    document.getElementById('missionsMenu').style.display = 'none';

    if (window.game) {
        window.game.restart();
        updateLevelInfo();
    }
}

function resetProgress() {
    if (confirm('¿Estás seguro de que quieres reiniciar todo tu progreso? Esta acción no se puede deshacer.')) {
        localStorage.removeItem('gameProgress');
        if (window.game) {
            window.game.levelProgress = window.game.loadProgress();
            window.game.level = 1;
            generateLevelMenu();
            alert('✅ Progreso reiniciado. Solo el nivel 1 está disponible.');
        }
    }
}

function nextLevel() {
    if (window.game) {
        window.game.initLevel();
        document.getElementById('gameOver').style.display = 'none';
        window.game.gameOver = false;
    }
}

function restartLevel() {
    if (window.game) {
        window.game.restart();
    }
}

// Settings Functions
function showSettings() {
    if (!settingsManager) {
        settingsManager = new SettingsManager();
    }

    settingsManager.updateUI();
    document.getElementById('settingsMenu').style.display = 'block';
    document.getElementById('levelMenu').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'none';
    document.getElementById('missionsMenu').style.display = 'none';
}

function closeSettings() {
    document.getElementById('settingsMenu').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';
}

function resetSettings() {
    if (confirm('¿Estás seguro de que quieres restaurar todos los ajustes a sus valores predeterminados?')) {
        settingsManager.resetToDefaults();
        alert('✅ Ajustes restaurados a valores predeterminados.');
    }
}

// Audio Functions
function toggleSound() {
    const toggle = document.getElementById('soundToggle');
    const isActive = !toggle.classList.contains('active');

    if (isActive) {
        toggle.classList.add('active');
    } else {
        toggle.classList.remove('active');
    }

    settingsManager.updateSetting('soundEnabled', isActive);
}

function toggleSFX() {
    const toggle = document.getElementById('sfxToggle');
    const isActive = !toggle.classList.contains('active');

    if (isActive) {
        toggle.classList.add('active');
    } else {
        toggle.classList.remove('active');
    }

    settingsManager.updateSetting('sfxEnabled', isActive);
}

function changeVolume(value) {
    document.getElementById('volumeValue').textContent = value + '%';
    settingsManager.updateSetting('volume', parseInt(value));
}

// Control Functions
function changeControlMode(mode) {
    settingsManager.updateSetting('controlMode', mode);
    console.log('Modo de control cambiado a:', mode);
}

function toggleGestureIndicators() {
    const toggle = document.getElementById('gestureIndicatorToggle');
    const isActive = !toggle.classList.contains('active');

    if (isActive) {
        toggle.classList.add('active');
    } else {
        toggle.classList.remove('active');
    }

    settingsManager.updateSetting('gestureIndicators', isActive);
}

function changeSensitivity(value) {
    document.getElementById('sensitivityValue').textContent = value;
    settingsManager.updateSetting('gestureSensitivity', parseInt(value));
}

function changeTouchSensitivity(value) {
    document.getElementById('touchSensitivityValue').textContent = value;
    settingsManager.updateSetting('touchSensitivity', parseInt(value));
}

// Appearance Functions
function changeTheme(theme) {
    document.querySelectorAll('.theme-option').forEach(option => {
        option.classList.remove('active');
        if (option.dataset.theme === theme) {
            option.classList.add('active');
        }
    });

    settingsManager.updateSetting('theme', theme);
}

function toggleEffects() {
    const toggle = document.getElementById('effectsToggle');
    const isActive = !toggle.classList.contains('active');

    if (isActive) {
        toggle.classList.add('active');
    } else {
        toggle.classList.remove('active');
    }

    settingsManager.updateSetting('visualEffects', isActive);
}

function toggleFPS() {
    const toggle = document.getElementById('fpsToggle');
    const isActive = !toggle.classList.contains('active');

    if (isActive) {
        toggle.classList.add('active');
    } else {
        toggle.classList.remove('active');
    }

    settingsManager.updateSetting('showFPS', isActive);
}

// Game Functions
function changeDifficulty(difficulty) {
    settingsManager.updateSetting('difficulty', difficulty);

    if (window.game) {
        switch (difficulty) {
            case 'easy':
                window.game.player.speed = 4.5;
                break;
            case 'normal':
                window.game.player.speed = 3.5;
                break;
            case 'hard':
                window.game.player.speed = 2.5;
                break;
            case 'extreme':
                window.game.player.speed = 2.0;
                break;
        }
    }
}

function changeHyperSpeed(value) {
    document.getElementById('hyperSpeedValue').textContent = value + 'x';
    settingsManager.updateSetting('hyperSpeed', parseFloat(value));
}

function toggleAutoSave() {
    const toggle = document.getElementById('autoSaveToggle');
    const isActive = !toggle.classList.contains('active');

    if (isActive) {
        toggle.classList.add('active');
    } else {
        toggle.classList.remove('active');
    }

    settingsManager.updateSetting('autoSave', isActive);
}

// Mission Functions
function toggleMissionNotifications() {
    const toggle = document.getElementById('missionNotificationsToggle');
    const isActive = !toggle.classList.contains('active');

    if (isActive) {
        toggle.classList.add('active');
    } else {
        toggle.classList.remove('active');
    }

    settingsManager.updateSetting('missionNotifications', isActive);
}

function showMissions() {
    if (!missionSystem) {
        missionSystem = new MissionSystem();
    }

    missionSystem.updateMissionsDisplay();
    document.getElementById('missionsMenu').style.display = 'block';
    document.getElementById('settingsMenu').style.display = 'none';
    document.getElementById('levelMenu').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'none';
}

function closeMissions() {
    document.getElementById('missionsMenu').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';
}

function resetMissions() {
    if (confirm('¿Estás seguro de que quieres reiniciar todas las misiones? Perderás todo el progreso de misiones.')) {
        if (missionSystem) {
            missionSystem.resetAllMissions();
        }
        alert('✅ Misiones reiniciadas correctamente');
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    settingsManager = new SettingsManager();
    missionSystem = new MissionSystem();

    // Initialize mobile controls if needed
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.innerWidth <= 768;

    if (isMobile) {
        document.getElementById('mobileControls').style.display = 'block';
        setupMobileControls();
    }
});

// Mobile Controls Setup
function setupMobileControls() {
    const buttons = {
        'mobileUp': 'w',
        'mobileDown': 's',
        'mobileLeft': 'a',
        'mobileRight': 'd'
    };

    Object.keys(buttons).forEach(buttonId => {
        const button = document.getElementById(buttonId);
        if (!button) return;

        const key = buttons[buttonId];

        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (window.game) {
                window.game.keys[key] = true;
            }
            button.classList.add('active');
        }, { passive: false });

        button.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (window.game) {
                window.game.keys[key] = false;
            }
            button.classList.remove('active');
        }, { passive: false });
    });

    // HyperSpeed button
    const hyperSpeedBtn = document.getElementById('mobileHyperSpeed');
    if (hyperSpeedBtn) {
        hyperSpeedBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (window.game) {
                window.game.keys[' '] = true;
            }
        }, { passive: false });

        hyperSpeedBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (window.game) {
                window.game.keys[' '] = false;
            }
        }, { passive: false });
    }

    // Menu buttons
    const levelBtn = document.getElementById('mobileLevels');
    if (levelBtn) {
        levelBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            showLevelMenu();
        }, { passive: false });
    }

    const settingsBtn = document.getElementById('mobileSettings');
    if (settingsBtn) {
        settingsBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            showSettings();
        }, { passive: false });
    }

    const missionsBtn = document.getElementById('mobileMissions');
    if (missionsBtn) {
        missionsBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            showMissions();
        }, { passive: false });
    }
}