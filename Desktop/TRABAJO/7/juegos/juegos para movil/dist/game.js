class MobileGame {
    constructor() {
        this.particles = [];
        this.stars = [];
        this.score = 0;
        this.gameRunning = false;
        this.animationId = 0;
        this.time = 0;
        this.combo = 0;
        this.lastHitTime = 0;
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        this.initializeGame();
        this.setupEventListeners();
        this.createStarField();
    }
    setupCanvas() {
        const resizeCanvas = () => {
            const container = this.canvas.parentElement;
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;
            this.canvas.width = containerWidth;
            this.canvas.height = containerHeight;
            this.createStarField();
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    }
    createStarField() {
        this.stars = [];
        const numStars = Math.floor((this.canvas.width * this.canvas.height) / 8000);
        for (let i = 0; i < numStars; i++) {
            this.stars.push({
                position: {
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height
                },
                size: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.8 + 0.2,
                twinkle: Math.random() * Math.PI * 2,
                speed: Math.random() * 0.02 + 0.01
            });
        }
    }
    initializeGame() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        // Dificultad 80%: Velocidad inicial más alta, pelota más pequeña
        this.ball = {
            position: { x: centerX, y: centerY },
            velocity: { x: 6.5, y: -6.5 }, // Velocidad inicial aumentada significativamente
            radius: 14, // Radio reducido para mayor dificultad
            trail: [],
            glow: 20,
            pulsePhase: 0
        };
        // Paleta más pequeña y más alejada del borde
        this.paddle = {
            position: { x: centerX - 50, y: this.canvas.height - 60 },
            width: 100, // Ancho reducido de 150 a 100
            height: 15, // Altura reducida
            glow: 15,
            pulsePhase: 0
        };
        this.particles = [];
        this.combo = 0;
    }
    setupEventListeners() {
        this.canvas.addEventListener('touchstart', this.handleTouch.bind(this), { passive: false });
        this.canvas.addEventListener('touchmove', this.handleTouch.bind(this), { passive: false });
        this.canvas.addEventListener('mousemove', this.handleMouse.bind(this));
        this.canvas.addEventListener('touchstart', (e) => e.preventDefault());
        this.canvas.addEventListener('touchmove', (e) => e.preventDefault());
    }
    handleTouch(event) {
        const rect = this.canvas.getBoundingClientRect();
        const touch = event.touches[0];
        const x = touch.clientX - rect.left;
        this.movePaddle(x);
    }
    handleMouse(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        this.movePaddle(x);
    }
    movePaddle(x) {
        this.paddle.position.x = Math.max(0, Math.min(x - this.paddle.width / 2, this.canvas.width - this.paddle.width));
    }
    createParticles(x, y, color, count = 8) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
            const speed = Math.random() * 4 + 2;
            this.particles.push({
                position: { x, y },
                velocity: {
                    x: Math.cos(angle) * speed,
                    y: Math.sin(angle) * speed
                },
                life: 1,
                maxLife: 1,
                color,
                size: Math.random() * 4 + 2,
                alpha: 1
            });
        }
    }
    updateBall() {
        this.ball.trail.push({ x: this.ball.position.x, y: this.ball.position.y });
        if (this.ball.trail.length > 15) {
            this.ball.trail.shift();
        }
        this.ball.pulsePhase += 0.15;
        this.ball.position.x += this.ball.velocity.x;
        this.ball.position.y += this.ball.velocity.y;
        if (this.ball.position.x <= this.ball.radius || this.ball.position.x >= this.canvas.width - this.ball.radius) {
            this.ball.velocity.x = -this.ball.velocity.x;
            this.createParticles(this.ball.position.x, this.ball.position.y, '#ff6b6b', 6);
        }
        if (this.ball.position.y <= this.ball.radius) {
            this.ball.velocity.y = -this.ball.velocity.y;
            this.createParticles(this.ball.position.x, this.ball.position.y, '#ff6b6b', 6);
        }
        if (this.ball.position.y + this.ball.radius >= this.paddle.position.y &&
            this.ball.position.x >= this.paddle.position.x &&
            this.ball.position.x <= this.paddle.position.x + this.paddle.width &&
            this.ball.velocity.y > 0) {
            this.ball.velocity.y = -Math.abs(this.ball.velocity.y);
            // Combo system - más estricto en dificultad 80%
            const currentTime = Date.now();
            if (currentTime - this.lastHitTime < 1500) { // Reducido de 2000ms a 1500ms
                this.combo++;
            }
            else {
                this.combo = 1;
            }
            this.lastHitTime = currentTime;
            const comboMultiplier = Math.min(this.combo, 8); // Reducido de 10 a 8
            this.score += 8 * comboMultiplier; // Reducido de 10 a 8 puntos base
            
            // Paddle hit effect - más impredecible en dificultad 80%
            const paddleCenter = this.paddle.position.x + this.paddle.width / 2;
            const hitPosition = (this.ball.position.x - paddleCenter) / (this.paddle.width / 2);
            this.ball.velocity.x += hitPosition * 4.5; // Aumentado de 3 a 4.5 para más variabilidad
            
            this.createParticles(this.ball.position.x, this.paddle.position.y, '#4ecdc4', 12);
            
            // Speed increase over time - más agresivo en dificultad 80%
            const speedMultiplier = 1 + (this.score / 600) * 0.15; // Aumenta más rápido
            this.ball.velocity.x *= speedMultiplier;
            this.ball.velocity.y *= speedMultiplier;
            
            // Añadir variación aleatoria ocasional para mayor dificultad
            if (Math.random() < 0.15) { // 15% de probabilidad
                this.ball.velocity.x += (Math.random() - 0.5) * 2;
                this.ball.velocity.y += (Math.random() - 0.5) * 1;
            }
        }
        if (this.ball.position.y > this.canvas.height + this.ball.radius) {
            this.gameOver();
        }
    }
    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.position.x += particle.velocity.x;
            particle.position.y += particle.velocity.y;
            particle.velocity.y += 0.1;
            particle.life -= 0.02;
            particle.alpha = particle.life;
            particle.size *= 0.98;
            return particle.life > 0;
        });
    }
    updateStars() {
        this.stars.forEach(star => {
            star.twinkle += star.speed;
            star.opacity = 0.3 + Math.sin(star.twinkle) * 0.4;
        });
    }
    drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        const hue1 = (this.time * 0.5) % 360;
        const hue2 = (this.time * 0.3 + 180) % 360;
        gradient.addColorStop(0, `hsl(${hue1}, 70%, 15%)`);
        gradient.addColorStop(0.5, `hsl(${(hue1 + hue2) / 2}, 60%, 10%)`);
        gradient.addColorStop(1, `hsl(${hue2}, 70%, 15%)`);
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    drawStars() {
        this.stars.forEach(star => {
            this.ctx.save();
            this.ctx.globalAlpha = star.opacity;
            this.ctx.fillStyle = '#ffffff';
            this.ctx.shadowBlur = star.size * 2;
            this.ctx.shadowColor = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(star.position.x, star.position.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }
    drawBall() {
        const pulseSize = this.ball.radius + Math.sin(this.ball.pulsePhase) * 3;
        this.ball.trail.forEach((pos, index) => {
            const alpha = index / this.ball.trail.length;
            const size = (this.ball.radius * alpha) / 2;
            this.ctx.save();
            this.ctx.globalAlpha = alpha * 0.6;
            const gradient = this.ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, size);
            gradient.addColorStop(0, '#ff6b6b');
            gradient.addColorStop(1, 'transparent');
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
        this.ctx.save();
        this.ctx.shadowBlur = this.ball.glow + Math.sin(this.ball.pulsePhase) * 5;
        this.ctx.shadowColor = '#ff6b6b';
        const ballGradient = this.ctx.createRadialGradient(this.ball.position.x - 5, this.ball.position.y - 5, 0, this.ball.position.x, this.ball.position.y, pulseSize);
        ballGradient.addColorStop(0, '#ffaaaa');
        ballGradient.addColorStop(0.7, '#ff6b6b');
        ballGradient.addColorStop(1, '#cc4444');
        this.ctx.fillStyle = ballGradient;
        this.ctx.beginPath();
        this.ctx.arc(this.ball.position.x, this.ball.position.y, pulseSize, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }
    drawPaddle() {
        this.paddle.pulsePhase += 0.1;
        const glowIntensity = this.paddle.glow + Math.sin(this.paddle.pulsePhase) * 3;
        this.ctx.save();
        this.ctx.shadowBlur = glowIntensity;
        this.ctx.shadowColor = '#4ecdc4';
        const paddleGradient = this.ctx.createLinearGradient(this.paddle.position.x, this.paddle.position.y, this.paddle.position.x, this.paddle.position.y + this.paddle.height);
        paddleGradient.addColorStop(0, '#7fdddd');
        paddleGradient.addColorStop(0.5, '#4ecdc4');
        paddleGradient.addColorStop(1, '#26a69a');
        this.ctx.fillStyle = paddleGradient;
        this.ctx.fillRect(this.paddle.position.x, this.paddle.position.y, this.paddle.width, this.paddle.height);
        this.ctx.restore();
    }
    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.fillStyle = particle.color;
            this.ctx.shadowBlur = particle.size;
            this.ctx.shadowColor = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.position.x, particle.position.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }
    drawUI() {
        this.ctx.save();
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 28px Arial';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#4ecdc4';
        this.ctx.fillText(`Score: ${this.score}`, 20, 45);
        if (this.combo > 1) {
            this.ctx.fillStyle = '#ffff00';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.shadowColor = '#ffff00';
            this.ctx.fillText(`Combo x${this.combo}!`, 20, 75);
        }
        this.ctx.restore();
    }
    draw() {
        this.drawBackground();
        this.drawStars();
        this.drawParticles();
        this.drawBall();
        this.drawPaddle();
        this.drawUI();
    }
    gameLoop() {
        if (!this.gameRunning)
            return;
        this.time += 1;
        this.updateBall();
        this.updateParticles();
        this.updateStars();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }
    startGame() {
        this.gameRunning = true;
        this.gameLoop();
    }
    stopGame() {
        this.gameRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    gameOver() {
        this.stopGame();
        this.ctx.save();
        const gradient = this.ctx.createRadialGradient(this.canvas.width / 2, this.canvas.height / 2, 0, this.canvas.width / 2, this.canvas.height / 2, this.canvas.width);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.font = 'bold 36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#ff6b6b';
        this.ctx.fillText('¡Game Over!', this.canvas.width / 2, this.canvas.height / 2 - 60);
        this.ctx.fillStyle = '#4ecdc4';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.shadowColor = '#4ecdc4';
        this.ctx.fillText(`Puntuación Final: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 - 20);
        if (this.combo > 5) {
            this.ctx.fillStyle = '#ffff00';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.shadowColor = '#ffff00';
            this.ctx.fillText(`¡Mejor Combo: ${this.combo}!`, this.canvas.width / 2, this.canvas.height / 2 + 10);
        }
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '18px Arial';
        this.ctx.shadowColor = '#ffffff';
        this.ctx.fillText('Toca para reiniciar', this.canvas.width / 2, this.canvas.height / 2 + 50);
        this.ctx.restore();
        const restartHandler = () => {
            this.canvas.removeEventListener('touchstart', restartHandler);
            this.canvas.removeEventListener('click', restartHandler);
            this.restart();
        };
        this.canvas.addEventListener('touchstart', restartHandler, { once: true });
        this.canvas.addEventListener('click', restartHandler, { once: true });
    }
    restart() {
        this.score = 0;
        this.combo = 0;
        this.time = 0;
        this.initializeGame();
        this.startGame();
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const game = new MobileGame();
    game.startGame();
});