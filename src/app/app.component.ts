import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ObjectGame {
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
  playerPosition = { x: 50, y: 90 };
  stars: ObjectGame[] = [];
  meteors: ObjectGame[] = [];
  score = 0;
  lives = 3;
  gameOver = false;
  starCounter = 0;
  meteorCounter = 0;
  level = 1;

  ngOnInit() {
    this.startGameLoop();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.gameOver) return;

    const speed = 5;

    switch (event.key) {
      case 'ArrowLeft':
      case 'a':
        this.playerPosition.x = Math.max(0, this.playerPosition.x - speed);
        break;
      case 'ArrowRight':
      case 'd':
        this.playerPosition.x = Math.min(100, this.playerPosition.x + speed);
        break;
      case 'ArrowUp':
      case 'w':
        this.playerPosition.y = Math.max(0, this.playerPosition.y - speed);
        break;
      case 'ArrowDown':
      case 's':
        this.playerPosition.y = Math.min(100, this.playerPosition.y + speed);
        break;
    }
  }

  startGameLoop() {
    setInterval(() => {
      if (this.gameOver) return;

      if (Math.random() < 0.03) {
        this.stars.push({ x: Math.random() * 100, y: 0, id: this.starCounter++ });
      }
      if (Math.random() < 0.01 * this.level) {
        this.meteors.push({ x: Math.random() * 100, y: 0, id: this.meteorCounter++ });
      }

      this.stars = this.stars.map(star => ({ ...star, y: star.y + 1 + this.level * 0.3 }));
      this.meteors = this.meteors.map(meteor => ({ ...meteor, y: meteor.y + 1 + this.level * 0.5 }));

      this.stars = this.stars.filter(star => {
        if (this.isColliding(this.playerPosition, star, 10, 10)) {
          this.score += 10;
          if (this.score >= this.level * 100) this.level++;
          return false;
        }
        return star.y <= 100;
      });

      this.meteors = this.meteors.filter(meteor => {
        if (this.isColliding(this.playerPosition, meteor, 10, 10)) {
          this.lives--;
          if (this.lives <= 0) this.gameOver = true;
          return false;
        }
        return meteor.y <= 100;
      });
    }, 50);
  }

  isColliding(pos1: { x: number; y: number }, pos2: { x: number; y: number }, width: number, height: number) {
    return Math.abs(pos1.x - pos2.x) < width && Math.abs(pos1.y - pos2.y) < height;
  }

  restartGame() {
    this.score = 0;
    this.lives = 3;
    this.stars = [];
    this.meteors = [];
    this.gameOver = false;
    this.playerPosition = { x: 50, y: 90 };
    this.level = 1;
  }
}
