import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiService } from "./api.service";
import { Item } from "../models/character.models";

@Injectable({
  providedIn: "root",
})
export class InventoryService {
  constructor(private api: ApiService) {}

  getInventory(): Observable<Item[]> {
    return this.api.get<Item[]>("inventory");
  }

  equipItem(itemId: number): Observable<any> {
    return this.api.post(`inventory/equip/${itemId}`);
  }

  unequipItem(itemId: number): Observable<any> {
    return this.api.post(`inventory/unequip/${itemId}`);
  }

  sellItem(itemId: number): Observable<any> {
    return this.api.post(`inventory/sell/${itemId}`);
  }
}
