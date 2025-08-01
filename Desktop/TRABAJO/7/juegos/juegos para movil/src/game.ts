interface Position {
  x: number;
  y: number;
}

interface Ball {
  position: Position;
  velocity: Position;
  radius: number;
  trail: Position[];
  glow: number;
  pulsePhase: number;
}

interface Paddle {
  position: Position;
  width: number;
  height: number;
  glow: number;
  pulsePhase: number;
}

interface Particle {
  position: Position;
  velocity: Position;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  alpha: number;
}

interface Star {
  position: Position;
  size: number;
  opacity: number;
  twinkle: number;
  speed: number;
}

class MobileGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private ball!: Ball; // Definite assignment assertion
  private paddle!: Paddle; // Definite assignment assertion
  private particles: Particle[] = [];
  private stars: Star[] = [];
  private score: number = 0;
  private gameRunning: boolean = false;
  private animationId: number = 0;
  private time: number = 0;
  private combo: number = 0;
  private lastHitTime: number = 0;

  constructor() {
    this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;

    this.setupCanvas();
    this.initializeGame();
    this.setupEventListeners();
    this.createStarField();
  }

  private setupCanvas(): void {
    const resizeCanvas = () => {
      const container = this.canvas.parentElement!;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      this.canvas.width = containerWidth;
      this.canvas.height = containerHeight;

      // Recreate stars when canvas resizes
      this.createStarField();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }

  private createStarField(): void {
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

  private initializeGame(): void {
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

  private setupEventListeners(): void {
    this.canvas.addEventListener('touchstart', this.handleTouch.bind(this), { passive: false });
    this.canvas.addEventListener('touchmove', this.handleTouch.bind(this), { passive: false });
    this.canvas.addEventListener('mousemove', this.handleMouse.bind(this));

    this.canvas.addEventListener('touchstart', (e) => e.preventDefault());
    this.canvas.addEventListener('touchmove', (e) => e.preventDefault());
  }

  private handleTouch(event: TouchEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const touch = event.touches[0];
    const x = touch.clientX - rect.left;
    this.movePaddle(x);
  }

  private handleMouse(event: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    this.movePaddle(x);
  }

  private movePaddle(x: number): void {
    this.paddle.position.x = Math.max(0, Math.min(x - this.paddle.width / 2, this.canvas.width - this.paddle.width));
  }

  private createParticles(x: number, y: number, color: string, count: number = 8): void {
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

  private updateBall(): void {
    // Add to trail
    this.ball.trail.push({ x: this.ball.position.x, y: this.ball.position.y });
    if (this.ball.trail.length > 15) {
      this.ball.trail.shift();
    }

    // Update pulse phase
    this.ball.pulsePhase += 0.15;

    // Move ball
    this.ball.position.x += this.ball.velocity.x;
    this.ball.position.y += this.ball.velocity.y;

    // Wall collisions with particles
    if (this.ball.position.x <= this.ball.radius || this.ball.position.x >= this.canvas.width - this.ball.radius) {
      this.ball.velocity.x = -this.ball.velocity.x;
      this.createParticles(this.ball.position.x, this.ball.position.y, '#ff6b6b', 6);
    }

    if (this.ball.position.y <= this.ball.radius) {
      this.ball.velocity.y = -this.ball.velocity.y;
      this.createParticles(this.ball.position.x, this.ball.position.y, '#ff6b6b', 6);
    }

    // Paddle collision
    if (this.ball.position.y + this.ball.radius >= this.paddle.position.y &&
      this.ball.position.x >= this.paddle.position.x &&
      this.ball.position.x <= this.paddle.position.x + this.paddle.width &&
      this.ball.velocity.y > 0) {

      this.ball.velocity.y = -Math.abs(this.ball.velocity.y);

      // Combo system - más estricto en dificultad 80%
      const currentTime = Date.now();
      if (currentTime - this.lastHitTime < 1500) { // Reducido de 2000ms a 1500ms
        this.combo++;
      } else {
        this.combo = 1;
      }
      this.lastHitTime = currentTime;

      const comboMultiplier = Math.min(this.combo, 8); // Reducido de 10 a 8
      this.score += 8 * comboMultiplier; // Reducido de 10 a 8 puntos base

      // Paddle hit effect - más impredecible en dificultad 80%
      const paddleCenter = this.paddle.position.x + this.paddle.width / 2;
      const hitPosition = (this.ball.position.x - paddleCenter) / (this.paddle.width / 2);
      this.ball.velocity.x += hitPosition * 4.5; // Aumentado de 3 a 4.5 para más variabilidad

      // Create hit particles
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

    // Game over condition
    if (this.ball.position.y > this.canvas.height + this.ball.radius) {
      this.gameOver();
    }
  }

  private updateParticles(): void {
    this.particles = this.particles.filter(particle => {
      particle.position.x += particle.velocity.x;
      particle.position.y += particle.velocity.y;
      particle.velocity.y += 0.1; // gravity
      particle.life -= 0.02;
      particle.alpha = particle.life;
      particle.size *= 0.98;

      return particle.life > 0;
    });
  }

  private updateStars(): void {
    this.stars.forEach(star => {
      star.twinkle += star.speed;
      star.opacity = 0.3 + Math.sin(star.twinkle) * 0.4;
    });
  }

  private drawBackground(): void {
    // Animated gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    const hue1 = (this.time * 0.5) % 360;
    const hue2 = (this.time * 0.3 + 180) % 360;

    gradient.addColorStop(0, `hsl(${hue1}, 70%, 15%)`);
    gradient.addColorStop(0.5, `hsl(${(hue1 + hue2) / 2}, 60%, 10%)`);
    gradient.addColorStop(1, `hsl(${hue2}, 70%, 15%)`);

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private drawStars(): void {
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

  private drawBall(): void {
    const pulseSize = this.ball.radius + Math.sin(this.ball.pulsePhase) * 3;

    // Draw trail
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

    // Draw ball glow
    this.ctx.save();
    this.ctx.shadowBlur = this.ball.glow + Math.sin(this.ball.pulsePhase) * 5;
    this.ctx.shadowColor = '#ff6b6b';

    const ballGradient = this.ctx.createRadialGradient(
      this.ball.position.x - 5, this.ball.position.y - 5, 0,
      this.ball.position.x, this.ball.position.y, pulseSize
    );
    ballGradient.addColorStop(0, '#ffaaaa');
    ballGradient.addColorStop(0.7, '#ff6b6b');
    ballGradient.addColorStop(1, '#cc4444');

    this.ctx.fillStyle = ballGradient;
    this.ctx.beginPath();
    this.ctx.arc(this.ball.position.x, this.ball.position.y, pulseSize, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  private drawPaddle(): void {
    this.paddle.pulsePhase += 0.1;
    const glowIntensity = this.paddle.glow + Math.sin(this.paddle.pulsePhase) * 3;

    this.ctx.save();
    this.ctx.shadowBlur = glowIntensity;
    this.ctx.shadowColor = '#4ecdc4';

    const paddleGradient = this.ctx.createLinearGradient(
      this.paddle.position.x, this.paddle.position.y,
      this.paddle.position.x, this.paddle.position.y + this.paddle.height
    );
    paddleGradient.addColorStop(0, '#7fdddd');
    paddleGradient.addColorStop(0.5, '#4ecdc4');
    paddleGradient.addColorStop(1, '#26a69a');

    this.ctx.fillStyle = paddleGradient;
    this.ctx.fillRect(
      this.paddle.position.x,
      this.paddle.position.y,
      this.paddle.width,
      this.paddle.height
    );
    this.ctx.restore();
  }

  private drawParticles(): void {
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

  private drawUI(): void {
    // Score with glow effect
    this.ctx.save();
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 28px Arial';
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = '#4ecdc4';
    this.ctx.fillText(`Score: ${this.score}`, 20, 45);

    // Combo indicator
    if (this.combo > 1) {
      this.ctx.fillStyle = '#ffff00';
      this.ctx.font = 'bold 20px Arial';
      this.ctx.shadowColor = '#ffff00';
      this.ctx.fillText(`Combo x${this.combo}!`, 20, 75);
    }

    this.ctx.restore();
  }

  private draw(): void {
    this.drawBackground();
    this.drawStars();
    this.drawParticles();
    this.drawBall();
    this.drawPaddle();
    this.drawUI();
  }

  private gameLoop(): void {
    if (!this.gameRunning) return;

    this.time += 1;
    this.updateBall();
    this.updateParticles();
    this.updateStars();
    this.draw();

    this.animationId = requestAnimationFrame(() => this.gameLoop());
  }

  public startGame(): void {
    this.gameRunning = true;
    this.gameLoop();
  }

  public stopGame(): void {
    this.gameRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  private gameOver(): void {
    this.stopGame();

    // Animated game over screen
    this.ctx.save();
    const gradient = this.ctx.createRadialGradient(
      this.canvas.width / 2, this.canvas.height / 2, 0,
      this.canvas.width / 2, this.canvas.height / 2, this.canvas.width
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Game over text with glow
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

  private restart(): void {
    this.score = 0;
    this.combo = 0;
    this.time = 0;
    this.initializeGame();
    this.startGame();
  }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const game = new MobileGame();
  game.startGame();
});