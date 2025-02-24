//front\monsterGameFight\src\app\core\navbar\navbar.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/services/auth.service';
import { Subscription } from 'rxjs';
import { WebSocketService } from '../services/websocket.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
  ],
})
export class NavbarComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  private authSubscription!: Subscription;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private webSocketService: WebSocketService
    
    ) {}

  ngOnInit() {
    this.authSubscription = this.authService.authState$.subscribe(
      (isAuthenticated) => {
        this.isAuthenticated = isAuthenticated;
      }
    );
    // Conexión inicial al servidor
    this.webSocketService.emit("register", localStorage.getItem("accessToken"));
  
    // Escuchar confirmación de registro
    this.webSocketService.on("registered").subscribe((data) => {
      if (data.success) {
        console.log(`Conexión establecida con éxito para el usuario ID: ${data.userId}`);
      }
    });
  
    // Escuchar errores de WebSocket
    this.webSocketService.on("error").subscribe((error) => {
      console.error("Error desde el servidor WebSocket:", error.message);
    });
  }

  ngOnDestroy() {
    // Limpiar la suscripción al destruir el componente
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
