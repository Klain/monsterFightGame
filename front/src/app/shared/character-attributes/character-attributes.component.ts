import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatGridListModule } from '@angular/material/grid-list';
import { CharacterService } from '../../core/services/character.service';
import { Character } from '../../core/models/chacter.models';
import { validAttributes } from '../../core/constants/attributes';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-character-attributes',
  standalone: true,
  templateUrl: './character-attributes.component.html',
  styleUrls: ['./character-attributes.component.css'],
  imports: [CommonModule, MatCardModule, MatGridListModule, MatButtonModule],
})
export class CharacterAttributesComponent implements OnInit {
  // Observable del personaje
  character$: Observable<Character | null>;
  isLoading: { [key: string]: boolean } = {};

  // Lista de atributos a mejorar
  attributeList = validAttributes.map(attr => ({
    label: this.formatLabel(attr),
    key: attr,
  }));

  constructor(private characterService: CharacterService, private snackBar: MatSnackBar) {
    // Observable reactivo del servicio
    this.character$ = this.characterService.character$;
  }

  ngOnInit() {
    // No necesitamos cargar costos por separado porque ahora están en el modelo del personaje.
  }

  // Mejorar un atributo
  upgradeAttribute(attribute: string) {
    if (this.isLoading[attribute]) return;
    this.isLoading[attribute] = true;
    this.characterService.upgradeAttribute(attribute);
  }

  // Mostrar un mensaje tipo toast
  showToast(message: string, type: 'success' | 'error' | 'info') {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: type === 'success' ? 'toast-success' : 'toast-error',
    });
  }

  private formatLabel(attribute: string): string {
    return attribute.charAt(0).toUpperCase() + attribute.slice(1);
  }
}
