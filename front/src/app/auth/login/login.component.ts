import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// Angular Material
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    MatIconModule
  ]
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  hidePassword: boolean = true; 
  
  constructor(private authService: AuthService, private router: Router, private snackBar: MatSnackBar) {}

  login() {
    if (this.isLoading) return;
    this.isLoading = true;

    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.showToast('Inicio de sesión exitoso!', 'success');
        this.router.navigate(['/game']);
      },
      error: (error:any) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Error al iniciar sesión';
        this.showToast(this.errorMessage, 'error');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  private showToast(message: string, type: 'success' | 'error') {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: type === 'success' ? 'toast-success' : 'toast-error'
    });
  }
}