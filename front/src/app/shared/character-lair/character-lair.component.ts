import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatGridListModule } from '@angular/material/grid-list';
import { CharacterService } from '../../core/services/character.service';
import { Observable } from 'rxjs';
import { Character } from 'src/app/core/models/character.models';
import { Lair } from 'src/app/core/models/character.models';

@Component({
  selector: 'app-character-lair',
  standalone: true,
  templateUrl: './character-lair.component.html',
  styleUrls: ['./character-lair.component.css'],
  imports: [CommonModule, MatCardModule, MatGridListModule, MatButtonModule],
})
export class CharacterLairComponent implements OnInit {
  character$: Observable<Character | null>;
  lairAttributes : {label:string,key:string,upgradeMethod:()=>void}[] = [];

  constructor(
    private characterService: CharacterService,
    private snackBar: MatSnackBar
  ) {
    this.character$ = this.characterService.character$;
    this.lairAttributes = [
        { label: 'Cofre de Oro', key: 'goldChest', upgradeMethod: () => this.characterService.upgradeGoldChest() },
        { label: 'Almacén', key: 'warehouse', upgradeMethod: () => this.characterService.upgradeWarehouse() },
        { label: 'Entorno', key: 'environment', upgradeMethod: () => this.characterService.upgradeEnviroment() },
        { label: 'Trampas', key: 'traps', upgradeMethod: () => this.characterService.upgradeTraps() }
    ];
    
  }

  ngOnInit() {
    this.character$.subscribe(() => {
    });
  }


  showToast(message: string, type: 'success' | 'error' | 'info') {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: type === 'success' ? 'toast-success' : 'toast-error',
    });
  }
}
