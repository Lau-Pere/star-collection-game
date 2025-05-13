import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Recolecta las Estrellas';
  playerPosition = { x: 50, y: 90 };
  stars: { x: number, y: number, id: number }[] = [];
  score = 0;
  lives = 3;
  gameOver = false;
  starCounter = 0;

  ngOnInit() {
    this.startGameLoop();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.gameOver) return;

    const speed = 5;
    switch (event.key) {
      case 'ArrowLeft':
        this.playerPosition.x = Math.max(0, this.playerPosition.x - speed);
        break;
      case 'ArrowRight':
        this.playerPosition.x = Math.min(100, this.playerPosition.x + speed);
        break;
    }
  }

  startGameLoop() {
    setInterval(() => {
      if (this.gameOver) return;

      if (Math.random() < 0.02) {
        this.stars.push({
          x: Math.random() * 100,
          y: 0,
          id: this.starCounter++
        });
      }

      this.stars = this.stars.map(star => ({
        ...star,
        y: star.y + 1
      }));

      this.stars = this.stars.filter(star => {
        const playerX = this.playerPosition.x;
        const playerY = this.playerPosition.y;
        const starX = star.x;
        const starY = star.y;

        if (
          Math.abs(playerX - starX) < 10 &&
          Math.abs(playerY - starY) < 5
        ) {
          this.score += 10;
          return false;
        }

        if (star.y > 100) {
          this.lives--;
          if (this.lives <= 0) {
            this.gameOver = true;
          }
          return false;
        }

        return true;
      });
    }, 50);
  }

  restartGame() {
    this.score = 0;
    this.lives = 3;
    this.stars = [];
    this.gameOver = false;
    this.playerPosition = { x: 50, y: 90 };
  }
}