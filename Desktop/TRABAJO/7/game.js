class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Mobile adaptation
        this.isMobile = this.detectMobile();
        this.setupCanvas();
        
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
        
        // Player with enhanced properties (balanced for 70% difficulty)
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
        this.touchKeys = {};
        this.setupInput();
        this.setupMobileControls();
        
        // Game objects
        this.obstacles = [];
        this.collectibles = [];
        this.goal = null;
        this.walls = [];
        
        // Audio context for sound effects
        this.audioContext = null;
        this.initAudio();
        
        // Initialize level
        this.initLevel();
        
        // Handle window resize
        this.setupResizeHandler();
        
        // Start game loop
        this.gameLoop();
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
        
        // Create grid pattern
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
    
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
               window.innerWidth <= 768;
    }
    
    setupCanvas() {
        if (this.isMobile) {
            // Ajustar canvas para móvil
            const container = document.getElementById('gameContainer');
            const maxWidth = Math.min(window.innerWidth - 20, 800);
            const maxHeight = Math.min(window.innerHeight * 0.6, 600);
            
            this.canvas.style.width = maxWidth + 'px';
            this.canvas.style.height = maxHeight + 'px';
            
            // Mantener proporción del juego
            const scale = Math.min(maxWidth / 800, maxHeight / 600);
            this.canvas.width = 800;
            this.canvas.height = 600;
            this.canvasScale = scale;
        }
    }
    
    setupResizeHandler() {
        window.addEventListener('resize', () => {
            if (this.isMobile) {
                this.setupCanvas();
            }
        });
        
        // Prevenir zoom en móvil
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });
        
        document.addEventListener('gesturestart', (e) => {
            e.preventDefault();
        });
    }
    
    setupInput() {
        // Controles de teclado (PC)
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            if (e.key === ' ' && this.gameOver) {
                this.restart();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        // Controles táctiles para reiniciar
        document.addEventListener('touchstart', (e) => {
            if (this.gameOver) {
                this.restart();
                e.preventDefault();
            }
        });
    }
    
    setupMobileControls() {
        if (!this.isMobile) return;
        
        const controlButtons = document.querySelectorAll('.control-btn[data-key]');
        
        controlButtons.forEach(button => {
            const key = button.getAttribute('data-key');
            
            // Touch start - activar tecla
            button.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.keys[key] = true;
                this.touchKeys[key] = true;
                button.style.background = 'rgba(255, 255, 255, 0.4)';
            });
            
            // Touch end - desactivar tecla
            button.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.keys[key] = false;
                this.touchKeys[key] = false;
                button.style.background = 'rgba(255, 255, 255, 0.2)';
            });
            
            // Touch cancel - desactivar tecla
            button.addEventListener('touchcancel', (e) => {
                e.preventDefault();
                this.keys[key] = false;
                this.touchKeys[key] = false;
                button.style.background = 'rgba(255, 255, 255, 0.2)';
            });
            
            // Prevenir selección de texto
            button.addEventListener('selectstart', (e) => {
                e.preventDefault();
            });
        });
        
        // Swipe controls como alternativa
        this.setupSwipeControls();
    }
    
    setupSwipeControls() {
        let startX, startY, startTime;
        const minSwipeDistance = 30;
        const maxSwipeTime = 300;
        
        this.canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                startTime = Date.now();
            }
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const endTime = Date.now();
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const deltaTime = endTime - startTime;
            
            if (deltaTime > maxSwipeTime) return;
            
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            if (distance < minSwipeDistance) return;
            
            // Determinar dirección del swipe
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Swipe horizontal
                if (deltaX > 0) {
                    this.simulateKeyPress('d', 100); // Derecha
                } else {
                    this.simulateKeyPress('a', 100); // Izquierda
                }
            } else {
                // Swipe vertical
                if (deltaY > 0) {
                    this.simulateKeyPress('s', 100); // Abajo
                } else {
                    this.simulateKeyPress('w', 100); // Arriba
                }
            }
            
            startX = startY = null;
        });
    }
    
    simulateKeyPress(key, duration) {
        this.keys[key] = true;
        setTimeout(() => {
            this.keys[key] = false;
        }, duration);
    }
    
    initLevel() {
        this.obstacles = [];
        this.collectibles = [];
        
        // Reset player position
        this.player.x = 50;
        this.player.y = 300;
        
        // Create level based on current level number
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
        
        // Goal area
        this.goal = {
            x: this.width - 80,
            y: this.height / 2 - 40,
            width: 60,
            height: 80,
            color: '#ffff00'
        };
    }
    
    createLevel1() {
        // Nivel 1 - Dificultad 70%: Más obstáculos y velocidad moderada
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
        
        // Coleccionables en posiciones desafiantes
        this.collectibles.push({
            x: 350,
            y: 250,
            width: 9,
            height: 9,
            collected: false,
            color: '#0088ff'
        });
        
        this.collectibles.push({
            x: 500,
            y: 350,
            width: 9,
            height: 9,
            collected: false,
            color: '#0088ff'
        });
    }
    
    createLevel2() {
        // Nivel 2 - Dificultad 70%: Patrón más complejo pero manejable
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
        
        // Obstáculos en movimiento circular moderado
        for (let i = 0; i < 2; i++) {
            this.obstacles.push({
                x: 400,
                y: 200,
                width: 14,
                height: 14,
                angle: i * Math.PI,
                radius: 60 + i * 30,
                speed: 0.08 + i * 0.02,
                color: '#ff0000'
            });
        }
        
        // Coleccionables estratégicamente ubicados
        for (let i = 0; i < 3; i++) {
            this.collectibles.push({
                x: 280 + i * 160,
                y: 200 + i * 80,
                width: 8,
                height: 8,
                collected: false,
                color: '#0088ff'
            });
        }
    }
    
    createLevel3() {
        // Nivel 3 - Dificultad 70%: Espirales desafiantes pero manejables
        for (let i = 0; i < 6; i++) {
            this.obstacles.push({
                x: 300,
                y: 300,
                width: 17,
                height: 17,
                angle: i * Math.PI / 3,
                radius: 80 + i * 25,
                speed: 0.07 + i * 0.015,
                color: '#ff0000'
            });
        }
        
        // Obstáculos lineales adicionales
        for (let i = 0; i < 3; i++) {
            this.obstacles.push({
                x: 150 + i * 200,
                y: 100 + i * 150,
                width: 16,
                height: 16,
                speedX: 5 * (i % 2 === 0 ? 1 : -1),
                speedY: 3.5 * (i % 2 === 0 ? 1 : -1),
                color: '#ff0000'
            });
        }
        
        // Coleccionables estratégicos
        this.collectibles.push({
            x: 295,
            y: 295,
            width: 8,
            height: 8,
            collected: false,
            color: '#0088ff'
        });
        
        this.collectibles.push({
            x: 450,
            y: 200,
            width: 8,
            height: 8,
            collected: false,
            color: '#0088ff'
        });
    }
    
    createRandomLevel() {
        // Niveles aleatorios - Dificultad 70%: Desafiante pero progresivo
        const difficultyMultiplier = 1 + (this.level - 4) * 0.3; // Incremento gradual
        const numObstacles = 6 + this.level * 2; // Más obstáculos pero no excesivo
        
        // Obstáculos lineales con velocidad moderada
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
        
        // Algunos obstáculos en espiral para variedad
        if (this.level >= 5) {
            const numSpirals = Math.min(2, Math.floor(this.level / 3));
            for (let i = 0; i < numSpirals; i++) {
                const centerX = 200 + Math.random() * 400;
                const centerY = 150 + Math.random() * 300;
                
                for (let j = 0; j < 4; j++) {
                    this.obstacles.push({
                        x: centerX,
                        y: centerY,
                        width: 15,
                        height: 15,
                        angle: j * Math.PI / 2,
                        radius: 60 + j * 20,
                        speed: (0.06 + Math.random() * 0.04) * difficultyMultiplier,
                        color: '#ff0000'
                    });
                }
            }
        }
        
        // Coleccionables estratégicos
        const numCollectibles = Math.min(4, Math.floor(this.level / 2) + 1);
        for (let i = 0; i < numCollectibles; i++) {
            this.collectibles.push({
                x: Math.random() * (this.width - 250) + 125,
                y: Math.random() * (this.height - 150) + 75,
                width: Math.max(7, 10 - Math.floor(this.level / 3)), // Se vuelven ligeramente más pequeños
                height: Math.max(7, 10 - Math.floor(this.level / 3)),
                collected: false,
                color: '#0088ff'
            });
        }
    }
    
    update() {
        if (this.gameOver || this.paused) return;
        
        this.time += 0.016; // Roughly 60fps
        
        // Update visual effects
        this.updateEffects();
        
        // Update player
        this.updatePlayer();
        
        // Update obstacles
        this.updateObstacles();
        
        // Update particles
        this.updateParticles();
        
        // Check collisions
        this.checkCollisions();
        
        // Check win condition
        this.checkWinCondition();
        
        // Update UI
        this.updateUI();
    }
    
    updateEffects() {
        // Screen shake decay
        this.screenShake *= 0.9;
        
        // Flash effect decay
        this.flashEffect *= 0.95;
        
        // Player glow effect
        this.player.glowIntensity = Math.sin(this.time * 8) * 0.3 + 0.7;
        
        // Player bounce animation
        this.player.bounceOffset = Math.sin(this.time * 12) * 2;
    }
    
    updateParticles() {
        // Update existing particles
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= 0.02;
            particle.size *= 0.98;
            return particle.life > 0 && particle.size > 0.5;
        });
        
        // Add trail particles for player
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
        
        // Add particles around collectibles
        this.collectibles.forEach(collectible => {
            if (!collectible.collected && Math.random() < 0.1) {
                this.particles.push({
                    x: collectible.x + collectible.width / 2,
                    y: collectible.y + collectible.height / 2,
                    vx: (Math.random() - 0.5) * 3,
                    vy: (Math.random() - 0.5) * 3,
                    size: Math.random() * 3 + 1,
                    life: 1,
                    color: `hsl(200, 100%, ${60 + Math.random() * 40}%)`
                });
            }
        });
    }
    
    updatePlayer() {
        let newX = this.player.x;
        let newY = this.player.y;
        
        // Handle input
        if (this.keys['w'] || this.keys['arrowup']) {
            newY -= this.player.speed;
        }
        if (this.keys['s'] || this.keys['arrowdown']) {
            newY += this.player.speed;
        }
        if (this.keys['a'] || this.keys['arrowleft']) {
            newX -= this.player.speed;
        }
        if (this.keys['d'] || this.keys['arrowright']) {
            newX += this.player.speed;
        }
        
        // Boundary checking
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
                // Circular motion
                obstacle.angle += obstacle.speed;
                obstacle.x = 300 + Math.cos(obstacle.angle) * obstacle.radius - obstacle.width / 2;
                obstacle.y = 300 + Math.sin(obstacle.angle) * obstacle.radius - obstacle.height / 2;
            } else {
                // Linear motion
                obstacle.x += obstacle.speedX;
                obstacle.y += obstacle.speedY;
                
                // Bounce off walls
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
        // Check obstacle collisions
        this.obstacles.forEach(obstacle => {
            if (this.isColliding(this.player, obstacle)) {
                this.playerDied();
            }
        });
        
        // Check collectible collisions
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
        // Check if player reached goal and collected all items
        const allCollected = this.collectibles.every(c => c.collected);
        if (allCollected && this.isColliding(this.player, this.goal)) {
            this.nextLevel();
        }
    }
    
    collectItem() {
        // Play collect sound
        this.playSound(800, 0.2, 'sine');
        
        // Create collection particles
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
        
        // Play death sound
        this.playSound(200, 0.5, 'sawtooth');
        
        // Screen shake effect
        this.screenShake = 15;
        
        // Flash effect
        this.flashEffect = 1;
        
        // Create death explosion particles
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
        
        // Reset player position
        this.player.x = 50;
        this.player.y = 300;
        
        // Reset collectibles
        this.collectibles.forEach(c => c.collected = false);
    }
    
    nextLevel() {
        this.level++;
        this.initLevel();
    }
    
    updateUI() {
        document.getElementById('level').textContent = this.level;
        document.getElementById('deaths').textContent = this.deaths;
        
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        document.getElementById('time').textContent = elapsed;
    }
    
    render() {
        // Apply screen shake
        this.ctx.save();
        if (this.screenShake > 0) {
            this.ctx.translate(
                (Math.random() - 0.5) * this.screenShake,
                (Math.random() - 0.5) * this.screenShake
            );
        }
        
        // Clear canvas with gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#0a0a0a');
        gradient.addColorStop(0.5, '#1a1a1a');
        gradient.addColorStop(1, '#0f0f0f');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw background pattern
        this.ctx.fillStyle = this.backgroundPattern;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw particles first (background layer)
        this.renderParticles();
        
        // Draw player with glow effect
        this.renderPlayer();
        
        // Draw obstacles with enhanced visuals
        this.renderObstacles();
        
        // Draw collectibles with glow
        this.renderCollectibles();
        
        // Draw goal with animation
        this.renderGoal();
        
        // Apply flash effect
        if (this.flashEffect > 0) {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${this.flashEffect * 0.3})`;
            this.ctx.fillRect(0, 0, this.width, this.height);
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
        
        // Player glow effect
        this.ctx.save();
        this.ctx.shadowBlur = 20 * this.player.glowIntensity;
        this.ctx.shadowColor = '#00ff88';
        
        // Player gradient
        const playerGradient = this.ctx.createRadialGradient(
            x + this.player.width / 2, y + this.player.height / 2, 0,
            x + this.player.width / 2, y + this.player.height / 2, this.player.width
        );
        playerGradient.addColorStop(0, '#00ff88');
        playerGradient.addColorStop(0.7, '#00cc66');
        playerGradient.addColorStop(1, '#008844');
        
        this.ctx.fillStyle = playerGradient;
        this.ctx.fillRect(x, y, this.player.width, this.player.height);
        
        // Player border
        this.ctx.strokeStyle = '#00ffaa';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, this.player.width, this.player.height);
        
        this.ctx.restore();
    }
    
    renderObstacles() {
        this.obstacles.forEach(obstacle => {
            this.ctx.save();
            
            // Obstacle glow and pulsing effect
            const pulseIntensity = Math.sin(this.time * 6) * 0.3 + 0.7;
            this.ctx.shadowBlur = 15 * pulseIntensity;
            this.ctx.shadowColor = '#ff3333';
            
            // Obstacle gradient
            const obstacleGradient = this.ctx.createRadialGradient(
                obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2, 0,
                obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2, obstacle.width
            );
            obstacleGradient.addColorStop(0, '#ff6666');
            obstacleGradient.addColorStop(0.7, '#ff3333');
            obstacleGradient.addColorStop(1, '#cc0000');
            
            this.ctx.fillStyle = obstacleGradient;
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            
            // Obstacle border
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
                
                // Collectible floating animation
                const floatOffset = Math.sin(this.time * 4 + collectible.x * 0.01) * 3;
                const y = collectible.y + floatOffset;
                
                // Collectible glow
                this.ctx.shadowBlur = 15;
                this.ctx.shadowColor = '#0088ff';
                
                // Collectible gradient
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
                
                // Inner sparkle
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
        
        // Goal pulsing effect
        const goalPulse = Math.sin(this.time * 3) * 0.2 + 0.8;
        this.ctx.shadowBlur = 25 * goalPulse;
        this.ctx.shadowColor = '#ffff00';
        
        // Goal gradient
        const goalGradient = this.ctx.createLinearGradient(
            this.goal.x, this.goal.y,
            this.goal.x + this.goal.width, this.goal.y + this.goal.height
        );
        goalGradient.addColorStop(0, '#ffff88');
        goalGradient.addColorStop(0.5, '#ffff00');
        goalGradient.addColorStop(1, '#cccc00');
        
        this.ctx.fillStyle = goalGradient;
        this.ctx.fillRect(this.goal.x, this.goal.y, this.goal.width, this.goal.height);
        
        // Goal border with animation
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(this.goal.x, this.goal.y, this.goal.width, this.goal.height);
        
        // Animated goal text
        this.ctx.fillStyle = '#000000';
        this.ctx.font = 'bold 14px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            'META',
            this.goal.x + this.goal.width / 2,
            this.goal.y + this.goal.height / 2 + 5
        );
        
        // Goal sparkles
        for (let i = 0; i < 3; i++) {
            const sparkleX = this.goal.x + Math.sin(this.time * 2 + i) * 20 + this.goal.width / 2;
            const sparkleY = this.goal.y + Math.cos(this.time * 2 + i) * 30 + this.goal.height / 2;
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(sparkleX, sparkleY, 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    restart() {
        this.level = 1;
        this.deaths = 0;
        this.startTime = Date.now();
        this.gameOver = false;
        this.initLevel();
        document.getElementById('gameOver').style.display = 'none';
    }
}

// Start the game when page loads
window.addEventListener('load', () => {
    new Game();
});