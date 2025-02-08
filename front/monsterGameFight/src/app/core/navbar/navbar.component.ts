import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

// Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

// Servicios
import { AuthService } from '../../core/services/auth.service';

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
  private intervalId: any;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.checkAuth();
    this.intervalId = setInterval(() => this.checkAuth(), 10000);
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }

  checkAuth() {
    const token = localStorage.getItem('token');

    if (token) {
      const tokenData = this.decodeToken(token);
      const currentTime = Math.floor(Date.now() / 1000);

      this.isAuthenticated = tokenData.exp > currentTime;
    } else {
      this.isAuthenticated = false;
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']); // Redirigir al Login tras cerrar sesión
  }

  private decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  }
}
