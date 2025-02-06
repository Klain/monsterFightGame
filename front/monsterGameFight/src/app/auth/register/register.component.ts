import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// Angular Material
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Servicios
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
})
export class RegisterComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(private authService: AuthService, private router: Router, private snackBar: MatSnackBar) {}

  register() {
    if (this.isLoading) return;

    this.isLoading = true;

    this.authService.register(this.username, this.password).subscribe({
      next: () => {
        this.showToast("Registro exitoso, redirigiendo...", "success");
        setTimeout(() => this.router.navigate(['/auth/login']), 2000);
      },
      error: (error: { error: { message: string } }) => {
        this.errorMessage = error.error?.message || 'Error en el registro';
        this.showToast(this.errorMessage, "error");
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  showToast(message: string, type: "success" | "error") {
    this.snackBar.open(message, "Cerrar", {
      duration: 3000,
      panelClass: type === "success" ? "toast-success" : "toast-error"
    });
  }
}
