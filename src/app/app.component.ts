import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Recolecta las Estrellas';
  playerPosition = { x: 220, y: 400 }; // Ajustado a 400 para estar visible
  stars: { x: number, y: number, id: number, type: 'star' | 'shootingStar' }[] = [];
  meteors: { x: number, y: number, id: number }[] = [];

  score = 0;
  lives = 3;
  level = 1;
  maxLevel = 5;
  gameOver = false;
  isImmune = false;
  starCounter = 0;
  meteorCounter = 0;
  immunityTimeoutId: any = null;
  private gameLoopId: number | null = null;

  readonly playerSize = 80;
  readonly gameWidth = 500;
  readonly gameHeight = 600;

  ngOnInit() {
    this.startGameLoop();
  }

  ngOnDestroy() {
    if (this.gameLoopId) cancelAnimationFrame(this.gameLoopId);
    if (this.immunityTimeoutId) clearTimeout(this.immunityTimeoutId);
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.gameOver) return;
    const speed = 6;

    switch (event.key) {
      case 'ArrowLeft':
        this.playerPosition.x = Math.max(0, this.playerPosition.x - speed);
        break;
      case 'ArrowRight':
        this.playerPosition.x = Math.min(this.gameWidth - this.playerSize, this.playerPosition.x + speed);
        break;
      case 'ArrowUp':
        this.playerPosition.y = Math.max(0, this.playerPosition.y - speed);
        event.preventDefault();
        break;
      case 'ArrowDown':
        this.playerPosition.y = Math.min(this.gameHeight - this.playerSize, this.playerPosition.y + speed);
        event.preventDefault();
        break;
    }
  }

  @HostListener('document:touchmove', ['$event'])
  handleTouchMove(event: TouchEvent) {
    if (this.gameOver) return;
    const touch = event.touches[0];
    const gameArea = document.querySelector('.game-area') as HTMLElement;
    if (!gameArea) return;

    const rect = gameArea.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    this.playerPosition.x = Math.max(0, Math.min(this.gameWidth - this.playerSize, x));
    this.playerPosition.y = Math.max(0, Math.min(this.gameHeight - this.playerSize, y));
    event.preventDefault();
  }

  startGameLoop() {
    if (this.gameLoopId) cancelAnimationFrame(this.gameLoopId);

    const gameLoop = () => {
      if (this.gameOver) return;

      const spawnStarProb = 0.008 + (this.level - 1) * 0.002; // Ajuste para velocidad inicial
      const spawnMeteorProb = 0.006 + (this.level - 1) * 0.002;

      if (Math.random() < spawnStarProb) {
        this.stars.push({
          x: Math.random() * (this.gameWidth - 40),
          y: 0,
          id: this.starCounter++,
          type: Math.random() < 0.15 ? 'shootingStar' : 'star'
        });
      }

      if (Math.random() < spawnMeteorProb) {
        this.meteors.push({
          x: Math.random() * (this.gameWidth - 60),
          y: 0,
          id: this.meteorCounter++
        });
      }

      const starSpeed = 0.5 + (this.level - 1) * 0.3; // Velocidad inicial más lenta
      const meteorSpeed = 0.7 + (this.level - 1) * 0.4;

      this.stars = this.stars
        .map(star => ({ ...star, y: star.y + starSpeed }))
        .filter(star => star.y <= this.gameHeight);

      this.meteors = this.meteors
        .map(meteor => ({ ...meteor, y: meteor.y + meteorSpeed }))
        .filter(meteor => meteor.y <= this.gameHeight);

      this.handleStarCollisions();
      this.handleMeteorCollisions();

      if (this.score >= this.level * 100) {
        if (this.level < this.maxLevel) {
          this.level++;
        } else {
          this.gameOver = true;
          this.title = '¡Llegaste a la Estación Galáctica!';
        }
      }

      this.gameLoopId = requestAnimationFrame(gameLoop);
    };

    this.gameLoopId = requestAnimationFrame(gameLoop);
  }

  handleStarCollisions() {
    this.stars = this.stars.filter(star => {
      const size = star.type === 'shootingStar' ? 35 : 20;
      const collision = this.checkCollision(star.x, star.y, size);
      if (collision) {
        if (star.type === 'shootingStar') {
          this.score += 50;
          this.isImmune = true;
          if (this.immunityTimeoutId) clearTimeout(this.immunityTimeoutId);
          this.immunityTimeoutId = setTimeout(() => (this.isImmune = false), 20000);
        } else {
          this.score += 10;
        }
        return false;
      }
      return true;
    });
  }

  handleMeteorCollisions() {
    this.meteors = this.meteors.filter(meteor => {
      const collision = this.checkCollision(meteor.x, meteor.y, 60);
      if (collision && !this.isImmune) {
        this.lives--;
        if (this.lives <= 0) this.gameOver = true;
        return false;
      }
      return true;
    });
  }

  checkCollision(objX: number, objY: number, objSize: number): boolean {
    const dx = this.playerPosition.x + this.playerSize / 2 - (objX + objSize / 2);
    const dy = this.playerPosition.y + this.playerSize / 2 - (objY + objSize / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (this.playerSize / 2 + objSize / 2);
  }

  restartGame() {
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.stars = [];
    this.meteors = [];
    this.playerPosition = { x: 220, y: 400 };
    this.title = 'Recolecta las Estrellas';
    this.gameOver = false;
    this.isImmune = false;
    if (this.immunityTimeoutId) clearTimeout(this.immunityTimeoutId);
    if (this.gameLoopId) cancelAnimationFrame(this.gameLoopId);
    this.startGameLoop();
  }
}