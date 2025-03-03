// src/app/pages/character-create/character-create.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';
import { CharacterService } from 'src/app/core/services/character.service';
import { ApiService } from 'src/app/core/services/api.service';
import { CharacterClass,getCharacterClassName } from 'src/app/core/enums/characterClass.enum';

@Component({
  selector: 'app-character-create',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './character-create.component.html',
  styleUrls: ['./character-create.component.scss']
})
export class CharacterCreateComponent {
  name = '';
  selectedClass = '';

  availableClasses = [
    { value: CharacterClass.CORSAIR , label: getCharacterClassName(CharacterClass.CORSAIR) },
    { value: CharacterClass.TREASURE_HUNTER, label: getCharacterClassName(CharacterClass.TREASURE_HUNTER) },
    { value: CharacterClass.ARCHEOMAGE, label: getCharacterClassName(CharacterClass.ARCHEOMAGE) },
  ];

  constructor(private apiService: ApiService, private characterService: CharacterService, private router: Router) {}

  createCharacter() {
    if (!this.name.trim() || !this.selectedClass) {
      alert('Debes elegir un nombre y una clase.');
      return;
    }

    this.apiService.post('characters/newCharacter', { characterName: this.name, characterClass: this.selectedClass }).subscribe({
      next: () => {
        this.characterService.character$.subscribe(() => {
          this.router.navigate(['/game']); 
        });
      },
      error: (err) => {
        console.error('Error al crear el personaje:', err);
      }
    });
  }
}
