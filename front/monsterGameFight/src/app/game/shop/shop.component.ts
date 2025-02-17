import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ShopService } from "../../core/services/shop.service";
import { Item } from "../../core/models/chacter.models";
import { ItemGridComponent } from "../../shared/Item-Grid-display/ItemGrid.component"; 
import { MatCardModule } from "@angular/material/card";

@Component({
  selector: "app-shop",
  standalone: true,
  imports: [CommonModule, MatCardModule, ItemGridComponent],
  templateUrl: "./shop.component.html",
  styleUrls: ["./shop.component.scss"],
})
export class ShopComponent implements OnInit {
  shopItems: Item[] = [];
  rows: number = 3; // Ajusta según el tamaño de la tienda
  cols: number = 5; // Ajusta según el tamaño de la tienda
  itemWidth: string = "80"; // Ajusta tamaño del ícono
  itemHeight: string = "80"; // Ajusta tamaño del ícono

  constructor(
    private shopService: ShopService,
    private changeDetectorRef:ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadShopItems();
  }

  loadShopItems() {
    this.shopService.getShopItems().subscribe((items: Item[]) => {
      this.shopItems = items.sort((a, b) => a.levelRequired - b.levelRequired);
      this.changeDetectorRef.detectChanges();
    });
  }

  buyItem(itemId: number) {
    this.shopService.buyItem(itemId).subscribe(() => this.loadShopItems());
  }

  // Métodos auxiliares para mostrar detalles en las esquinas del ItemGrid
  getTopLeftText(item: Item) {
    return  "";
  }

  getBottomRightText(item: Item) {
    return item.price ? `$${item.price}` : "";
  }
}
