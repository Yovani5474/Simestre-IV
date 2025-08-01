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
        this.gestureStabilityFrames = 3;
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
                document.getElementById('gestureStatus').style.display = 'block';
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
            document.getElementById('gestureStatus').style.display = 'none';
        }
    }

    onResults(results) {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            const gesture = this.recognizeGesture(landmarks);
            this.updateGestureDisplay(gesture);
            
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
            this.updateGestureDisplay(null);
            this.gestureHistory = [];
            if (this.currentGesture !== null) {
                this.currentGesture = null;
                this.triggerGestureCallback(null);
            }
        }
    }

    recognizeGesture(landmarks) {
        // Get key finger positions
        const fingerTips = [
            landmarks[8],  // Index finger tip
            landmarks[12], // Middle finger tip
            landmarks[16], // Ring finger tip
            landmarks[20]  // Pinky tip
        ];
        
        const fingerPips = [
            landmarks[6],  // Index finger PIP
            landmarks[10], // Middle finger PIP
            landmarks[14], // Ring finger PIP
            landmarks[18]  // Pinky PIP
        ];

        const thumbTip = landmarks[4];
        const thumbIp = landmarks[3];
        const wrist = landmarks[0];
        const indexTip = landmarks[8];
        const indexPip = landmarks[6];

        // Check if fingers are extended
        const fingersUp = [];
        
        // Thumb (special case - check x coordinate)
        fingersUp.push(thumbTip.x > thumbIp.x);
        
        // Other fingers (check y coordinate)
        for (let i = 0; i < 4; i++) {
            fingersUp.push(fingerTips[i].y < fingerPips[i].y);
        }

        const totalFingersUp = fingersUp.filter(Boolean).length;

        // Gesture recognition logic
        if (totalFingersUp === 5) {
            return 'open_hand'; // All fingers up - pause/restart
        } else if (totalFingersUp === 1 && fingersUp[1]) {
            // Only index finger up - check direction
            const indexDirection = this.getPointingDirection(indexTip, wrist);
            return indexDirection;
        }

        return null; // No recognized gesture
    }

    getPointingDirection(fingerTip, wrist) {
        const deltaX = fingerTip.x - wrist.x;
        const deltaY = fingerTip.y - wrist.y;
        
        // Determine primary direction
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            return deltaX > 0 ? 'right' : 'left';
        } else {
            return deltaY < 0 ? 'up' : 'down';
        }
    }

    getStableGesture() {
        if (this.gestureHistory.length < this.gestureStabilityFrames) {
            return null;
        }
        
        // Check if all recent gestures are the same
        const lastGesture = this.gestureHistory[this.gestureHistory.length - 1];
        const isStable = this.gestureHistory.every(gesture => gesture === lastGesture);
        
        return isStable ? lastGesture : null;
    }

    updateGestureDisplay(gesture) {
        // Reset all indicators
        const indicators = ['upGesture', 'downGesture', 'leftGesture', 'rightGesture', 'pauseGesture'];
        indicators.forEach(id => {
            const element = document.getElementById(id);
            element.className = 'gesture-icon inactive';
        });

        // Activate current gesture indicator
        if (gesture) {
            let activeId = null;
            switch (gesture) {
                case 'up': activeId = 'upGesture'; break;
                case 'down': activeId = 'downGesture'; break;
                case 'left': activeId = 'leftGesture'; break;
                case 'right': activeId = 'rightGesture'; break;
                case 'open_hand': activeId = 'pauseGesture'; break;
            }
            
            if (activeId) {
                document.getElementById(activeId).className = 'gesture-icon active';
            }
        }
    }

    triggerGestureCallback(gesture) {
        if (this.gestureCallbacks[gesture]) {
            this.gestureCallbacks[gesture]();
        }
        // Also trigger null callback when no gesture
        if (gesture === null && this.gestureCallbacks['none']) {
            this.gestureCallbacks['none']();
        }
    }

    onGesture(gesture, callback) {
        this.gestureCallbacks[gesture] = callback;
    }
}

// Game Class (Enhanced from original)
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Initialize gesture controller
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
            trail: [],
            glowIntensity: 0,
            bounceOffset: 0
        };
        
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
        this.gestureController.onGesture('up', () => {
            this.gestureKeys['w'] = true;
        });
        
        this.gestureController.onGesture('down', () => {
            this.gestureKeys['s'] = true;
        });
        
        this.gestureController.onGesture('left', () => {
            this.gestureKeys['a'] = true;
        });
        
        this.gestureController.onGesture('right', () => {
            this.gestureKeys['d'] = true;
        });
        
        this.gestureController.onGesture('open_hand', () => {
            if (this.gameOver) {
                this.restart();
            } else {
                this.paused = !this.paused;
            }
        });
        
        this.gestureController.onGesture('none', () => {
            // Clear all gesture keys when no gesture detected
            this.gestureKeys = {};
        });
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
        
        this.player.x = 50;
        this.player.y = 300;
        
        switch(this.level) {
            case 1:
                this.createLevel1();
                break;
            case 2:
                this.createLevel2();
                break;
            case 3:
                this.createLevel3();
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

    createRandomLevel() {
        const difficultyMultiplier = 1 + (this.level - 4) * 0.3;
        const numObstacles = 6 + this.level * 2;
        
        for (let i = 0; i < numObstacles; i++) {
            this.obstacles.push({
                x: Math.random() * (this.width - 120) + 60,
                y: Math.random() * (this.height - 120) + 60,
                width: 14 + Math.random() * 8,
                height: 14 + Math.random() * 8,
                speedX: (Math.random() - 0.5) * 8 * difficultyMultiplier,
                speedY: (Math.random() - 0.5) * 8 * difficultyMultiplier,
                color: '#ff0000'
            });
        }
        
        const numCollectibles = Math.min(4, Math.floor(this.level / 2) + 1);
        for (let i = 0; i < numCollectibles; i++) {
            this.collectibles.push({
                x: Math.random() * (this.width - 250) + 125,
                y: Math.random() * (this.height - 150) + 75,
                width: Math.max(7, 10 - Math.floor(this.level / 3)),
                height: Math.max(7, 10 - Math.floor(this.level / 3)),
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
        this.updateObstacles();
        this.updateParticles();
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
            particle.life -= 0.02;
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
        
        // Combine keyboard and gesture input
        const activeKeys = { ...this.keys, ...this.gestureKeys };
        
        if (activeKeys['w'] || activeKeys['arrowup']) {
            newY -= this.player.speed;
        }
        if (activeKeys['s'] || activeKeys['arrowdown']) {
            newY += this.player.speed;
        }
        if (activeKeys['a'] || activeKeys['arrowleft']) {
            newX -= this.player.speed;
        }
        if (activeKeys['d'] || activeKeys['arrowright']) {
            newX += this.player.speed;
        }
        
        if (newX >= 0 && newX <= this.width - this.player.width) {
            this.player.x = newX;
        }
        if (newY >= 0 && newY <= this.height - this.player.height) {
            this.player.y = newY;
        }
    }

    updateObstacles() {
        this.obstacles.forEach(obstacle => {
            if (obstacle.angle !== undefined) {
                obstacle.angle += obstacle.speed;
                obstacle.x = 300 + Math.cos(obstacle.angle) * obstacle.radius - obstacle.width / 2;
                obstacle.y = 300 + Math.sin(obstacle.angle) * obstacle.radius - obstacle.height / 2;
            } else {
                obstacle.x += obstacle.speedX;
                obstacle.y += obstacle.speedY;
                
                if (obstacle.x <= 0 || obstacle.x >= this.width - obstacle.width) {
                    obstacle.speedX *= -1;
                }
                if (obstacle.y <= 0 || obstacle.y >= this.height - obstacle.height) {
                    obstacle.speedY *= -1;
                }
            }
        });
    }

    checkCollisions() {
        this.obstacles.forEach(obstacle => {
            if (this.isColliding(this.player, obstacle)) {
                this.playerDied();
            }
        });
        
        this.collectibles.forEach(collectible => {
            if (!collectible.collected && this.isColliding(this.player, collectible)) {
                collectible.collected = true;
                this.collectItem();
            }
        });
    }

    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    checkWinCondition() {
        const allCollected = this.collectibles.every(c => c.collected);
        if (allCollected && this.isColliding(this.player, this.goal)) {
            this.nextLevel();
        }
    }

    collectItem() {
        this.playSound(800, 0.2, 'sine');
        
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: this.player.x + this.player.width / 2,
                y: this.player.y + this.player.height / 2,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                size: Math.random() * 6 + 3,
                life: 1,
                color: `hsl(200, 100%, ${70 + Math.random() * 30}%)`
            });
        }
    }

    playerDied() {
        this.deaths++;
        this.playSound(200, 0.5, 'sawtooth');
        this.screenShake = 15;
        this.flashEffect = 1;
        
        for (let i = 0; i < 30; i++) {
            this.particles.push({
                x: this.player.x + this.player.width / 2,
                y: this.player.y + this.player.height / 2,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 0.5) * 12,
                size: Math.random() * 8 + 4,
                life: 1,
                color: `hsl(${Math.random() * 60}, 100%, ${50 + Math.random() * 50}%)`
            });
        }
        
        this.player.x = 50;
        this.player.y = 300;
        this.collectibles.forEach(c => c.collected = false);
    }

    nextLevel() {
        this.level++;
        this.initLevel();
    }

    restart() {
        this.gameOver = false;
        this.level = 1;
        this.deaths = 0;
        this.startTime = Date.now();
        this.initLevel();
        document.getElementById('gameOver').style.display = 'none';
    }

    updateUI() {
        document.getElementById('level').textContent = this.level;
        document.getElementById('deaths').textContent = this.deaths;
        
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        document.getElementById('time').textContent = elapsed;
    }

    render() {
        this.ctx.save();
        if (this.screenShake > 0) {
            this.ctx.translate(
                (Math.random() - 0.5) * this.screenShake,
                (Math.random() - 0.5) * this.screenShake
            );
        }
        
        // Background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#0a0a0a');
        gradient.addColorStop(0.5, '#1a1a1a');
        gradient.addColorStop(1, '#0f0f0f');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.fillStyle = this.backgroundPattern;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.renderParticles();
        this.renderPlayer();
        this.renderObstacles();
        this.renderCollectibles();
        this.renderGoal();
        
        if (this.flashEffect > 0) {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${this.flashEffect * 0.3})`;
            this.ctx.fillRect(0, 0, this.width, this.height);
        }
        
        // Pause overlay
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

    renderParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }

    renderPlayer() {
        const x = this.player.x;
        const y = this.player.y + this.player.bounceOffset;
        
        this.ctx.save();
        this.ctx.shadowBlur = 20 * this.player.glowIntensity;
        this.ctx.shadowColor = '#00ff88';
        
        const playerGradient = this.ctx.createRadialGradient(
            x + this.player.width / 2, y + this.player.height / 2, 0,
            x + this.player.width / 2, y + this.player.height / 2, this.player.width
        );
        playerGradient.addColorStop(0, '#00ff88');
        playerGradient.addColorStop(0.7, '#00cc66');
        playerGradient.addColorStop(1, '#008844');
        
        this.ctx.fillStyle = playerGradient;
        this.ctx.fillRect(x, y, this.player.width, this.player.height);
        
        this.ctx.strokeStyle = '#00ffaa';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, this.player.width, this.player.height);
        
        this.ctx.restore();
    }

    renderObstacles() {
        this.obstacles.forEach(obstacle => {
            this.ctx.save();
            
            const pulseIntensity = Math.sin(this.time * 6) * 0.3 + 0.7;
            this.ctx.shadowBlur = 15 * pulseIntensity;
            this.ctx.shadowColor = '#ff3333';
            
            const obstacleGradient = this.ctx.createRadialGradient(
                obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2, 0,
                obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2, obstacle.width
            );
            obstacleGradient.addColorStop(0, '#ff6666');
            obstacleGradient.addColorStop(0.7, '#ff3333');
            obstacleGradient.addColorStop(1, '#cc0000');
            
            this.ctx.fillStyle = obstacleGradient;
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            
            this.ctx.strokeStyle = '#ff0000';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            
            this.ctx.restore();
        });
    }

    renderCollectibles() {
        this.collectibles.forEach(collectible => {
            if (!collectible.collected) {
                this.ctx.save();
                
                const floatOffset = Math.sin(this.time * 4 + collectible.x * 0.01) * 3;
                const y = collectible.y + floatOffset;
                
                this.ctx.shadowBlur = 15;
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
                    collectible.width / 2 + 2,
                    0, Math.PI * 2
                );
                this.ctx.fill();
                
                this.ctx.fillStyle = '#ffffff';
                this.ctx.beginPath();
                this.ctx.arc(
                    collectible.x + collectible.width / 2 - 2,
                    y + collectible.height / 2 - 2,
                    2, 0, Math.PI * 2
                );
                this.ctx.fill();
                
                this.ctx.restore();
            }
        });
    }

    renderGoal() {
        this.ctx.save();
        
        const goalPulse = Math.sin(this.time * 3) * 0.2 + 0.8;
        this.ctx.shadowBlur = 25 * goalPulse;
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
        
        this.ctx.strokeStyle = '#ffff00';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(this.goal.x, this.goal.y, this.goal.width, this.goal.height);
        
        this.ctx.restore();
    }

    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Global functions for camera permission
async function startCamera() {
    document.getElementById('cameraPermission').style.display = 'none';
    
    const game = new Game();
    const gesturesEnabled = await game.enableGestures();
    
    if (!gesturesEnabled) {
        alert('No se pudo acceder a la cámara. El juego funcionará con controles de teclado.');
    }
    
    window.game = game; // Make game accessible globally
}

function playWithoutCamera() {
    document.getElementById('cameraPermission').style.display = 'none';
    window.game = new Game();
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Game will be initialized when user chooses camera option
});