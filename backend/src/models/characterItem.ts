export class CharacterItem {
  id: number = 0;
  characterId: number = 0;
  itemId: number = 0;
  equipped: boolean = false;

  constructor(data: Partial<CharacterItem>) {
    Object.assign(this, data);
  }
}
