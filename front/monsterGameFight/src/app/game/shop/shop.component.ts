import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { ShopService } from "../../core/services/shop.service";
import { Item } from "../../core/models/chacter.models";

@Component({
  selector: "app-shop",
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: "./shop.component.html",
  styleUrls: ["./shop.component.scss"],
})
export class ShopComponent implements OnInit {
  shopItems: Item[] = [];

  constructor(private shopService: ShopService) {}

  ngOnInit(): void {
    this.loadShopItems();
  }

  loadShopItems() {
    this.shopService.getShopItems().subscribe((items:Item[]) => {
      this.shopItems = items;
    });
  }

  buyItem(itemId: number) {
    this.shopService.buyItem(itemId).subscribe(() => this.loadShopItems());
  }
}
