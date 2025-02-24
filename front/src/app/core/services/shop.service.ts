import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiService } from "./api.service";
import { Item } from "../models/character.models";

@Injectable({
  providedIn: "root",
})
export class ShopService {
  constructor(private api: ApiService) {}

  getShopItems(): Observable<Item[]> {
    return this.api.get<Item[]>("shop");
  }

  buyItem(itemId: number): Observable<any> {
    return this.api.post(`shop/buy`,{ itemId });
  }

  sellItem(itemId: number): Observable<any> {
    return this.api.post(`shop/sell`,{ itemId });
  }
}
