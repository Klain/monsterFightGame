import { Component, OnInit } from '@angular/core';
import { WebSocketService } from './core/services/websocket.service';
import { AuthService } from './core/services/auth.service';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './core/navbar/navbar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'monsterGameFight';
  constructor(private webSocketService: WebSocketService, private authService: AuthService) {}

  ngOnInit() {
    console.log("🟢 Aplicación iniciada. WebSocket Manager activado.");

    // Solo conectar WebSocket si el usuario ya está autenticado al iniciar la aplicación
    if (this.authService.isAuthenticated()) {
      this.webSocketService.connect();
    }
  }
}