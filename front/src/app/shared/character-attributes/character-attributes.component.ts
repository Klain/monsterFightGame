import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatGridListModule } from '@angular/material/grid-list';
import { CharacterService } from '../../core/services/character.service';
import { validAttributes } from '../../core/constants/attributes';
import { Observable } from 'rxjs';
import { Character } from 'src/app/core/models/character.models';

@Component({
  selector: 'app-character-attributes',
  standalone: true,
  templateUrl: './character-attributes.component.html',
  styleUrls: ['./character-attributes.component.css'],
  imports: [CommonModule, MatCardModule, MatGridListModule, MatButtonModule],
})
export class CharacterAttributesComponent implements OnInit {
  character$: Observable<Character | null>;
  isLoading: { [key: string]: boolean } = {};

  attributeList = validAttributes.map(attr => ({
    label: this.formatLabel(attr),
    key: attr,
  }));

  constructor(
    private characterService: CharacterService, 
    private snackBar: MatSnackBar
  ) {
    this.character$ = this.characterService.character$;
  }

  ngOnInit() {
    this.character$.subscribe(() => {
      this.isLoading = {}; 
    });
  }

  upgradeAttribute(attribute: string) {
    if (this.isLoading[attribute]) return;
    
    this.isLoading[attribute] = true;
    this.characterService.upgradeAttribute(attribute);
  }
  
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
