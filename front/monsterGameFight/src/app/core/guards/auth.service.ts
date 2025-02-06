import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token');

    if (!token) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    const tokenData = this.decodeToken(token);
    const currentTime = Math.floor(Date.now() / 1000);

    if (tokenData.exp < currentTime) {
      this.authService.logout();  
      return false;
    }

    return true;
  }

  private decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1])); 
    } catch (e) {
      return null;
    }
  }
}
