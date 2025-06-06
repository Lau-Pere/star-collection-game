import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Entity {
  x: number;
  y: number;
  id: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Recolecta las Estrellas';
  playerPosition = { x: 50, y: 80 };
  stars: Entity[] = [];
  meteors: Entity[] = [];
  shootingStars: Entity[] = [];
  score = 0;
  lives = 5;
  level = 1;
  gameOver = false;
  immune = false;
  immuneTimeout?: any;
  starCounter = 0;
  meteorCounter = 0;
  shootingStarCounter = 0;

  ngOnInit() {
    this.startGameLoop();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.gameOver) return;

    const speed = 4;

    switch (event.key) {
      case 'ArrowLeft':
        this.playerPosition.x = Math.max(0, this.playerPosition.x - speed);
        break;
      case 'ArrowRight':
        this.playerPosition.x = Math.min(100, this.playerPosition.x + speed);
        break;
      case 'ArrowUp':
        this.playerPosition.y = Math.max(0, this.playerPosition.y - speed);
        break;
      case 'ArrowDown':
        this.playerPosition.y = Math.min(95, this.playerPosition.y + speed);
        break;
    }
  }

  startGameLoop() {
    setInterval(() => {
      if (this.gameOver) return;

      // Crear estrellas normales
      if (Math.random() < 0.03 + this.level * 0.01) {
        this.stars.push({ x: Math.random() * 100, y: 0, id: this.starCounter++ });
      }

      // Crear meteoritos
      if (Math.random() < 0.01 + this.level * 0.005) {
        this.meteors.push({ x: Math.random() * 100, y: 0, id: this.meteorCounter++ });
      }

      // Crear estrellas fugaces (shooting stars)
      if (Math.random() < 0.002) {
        this.shootingStars.push({ x: 100, y: Math.random() * 50, id: this.shootingStarCounter++ });
      }

      // Actualizar posición de estrellas normales
      this.stars = this.stars.map(star => ({ ...star, y: star.y + 1 + this.level * 0.3 }));

      // Actualizar meteoritos
      this.meteors = this.meteors.map(meteor => ({ ...meteor, y: meteor.y + 1.5 + this.level * 0.4 }));

      // Actualizar estrellas fugaces (se mueven de derecha a izquierda rápido)
      this.shootingStars = this.shootingStars.map(star => ({ ...star, x: star.x - 3 }));

      // Filtrar estrellas normales y detectar colisiones con jugador
      this.stars = this.stars.filter(star => {
        if (this.checkCollision(this.playerPosition, star, 8, 8)) {
          this.score += 10;
          return false; // estrella recogida
        }
        // si se salen de la pantalla pierde vida
        if (star.y > 100) {
          this.lives--;
          if (this.lives <= 0) this.gameOver = true;
          return false;
        }
        return true;
      });

      // Filtrar meteoritos y detectar colisiones con jugador (si no está inmune)
      this.meteors = this.meteors.filter(meteor => {
        if (this.checkCollision(this.playerPosition, meteor, 8, 8)) {
          if (!this.immune) {
            this.lives--;
            this.immune = true;
            clearTimeout(this.immuneTimeout);
            this.immuneTimeout = setTimeout(() => this.immune = false, 3000);
            if (this.lives <= 0) this.gameOver = true;
          }
          return false;
        }
        if (meteor.y > 100) return false; // fuera pantalla
        return true;
      });

      // Filtrar estrellas fugaces y detectar colisiones
      this.shootingStars = this.shootingStars.filter(star => {
        if (this.checkCollision(this.playerPosition, star, 8, 8)) {
          // 50% da vida extra (hasta 5), 50% da inmunidad por 5 segundos
          if (Math.random() < 0.5) {
            this.lives = Math.min(5, this.lives + 1);
          } else {
            this.immune = true;
            clearTimeout(this.immuneTimeout);
            this.immuneTimeout = setTimeout(() => this.immune = false, 5000);
          }
          return false;
        }
        if (star.x < 0) return false;
        return true;
      });

      // Subir de nivel cada 100 puntos, resetear estrellas y meteoros
      if (this.score >= this.level * 100) {
        this.level++;
        if (this.level > 5) {
          this.gameOver = true; // ganaste el juego en nivel 5
        } else {
          this.stars = [];
          this.meteors = [];
          this.shootingStars = [];
        }
      }

    }, 40);
  }

  checkCollision(a: { x: number, y: number }, b: { x: number, y: number }, rangeX: number, rangeY: number): boolean {
    return Math.abs(a.x - b.x) < rangeX && Math.abs(a.y - b.y) < rangeY;
  }

  restartGame() {
    this.score = 0;
    this.lives = 5;
    this.level = 1;
    this.stars = [];
    this.meteors = [];
    this.shootingStars = [];
    this.gameOver = false;
    this.immune = false;
    this.playerPosition = { x: 50, y: 80 };
  }
}
