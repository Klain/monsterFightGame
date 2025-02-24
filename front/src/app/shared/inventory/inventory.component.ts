import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { InventoryService } from "../../core/services/inventory.service";
import { WebSocketService } from "../../core/services/websocket.service";
import { Item } from "../../core/models/character.models";

@Component({
  selector: "app-inventory",
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: "./inventory.component.html",
  styleUrls: ["./inventory.component.scss"],
})
export class InventoryComponent implements OnInit {
  inventory: Item[] = [];

  constructor(
    private inventoryService: InventoryService,
    private wsService: WebSocketService
  ) {}

  ngOnInit(): void {
    this.loadInventory();

    // Escuchar actualizaciones desde WebSocket
    this.wsService.on("inventory-update").subscribe((updatedInventory: Item[]) => {
      this.inventory = updatedInventory;
    });
  }

  loadInventory() {
    this.inventoryService.getInventory().subscribe((items) => {
      this.inventory = items;
    });
  }

  equipItem(itemId: number) {
    this.inventoryService.equipItem(itemId).subscribe(() => this.loadInventory());
  }

  unequipItem(itemId: number) {
    this.inventoryService.unequipItem(itemId).subscribe(() => this.loadInventory());
  }

  sellItem(itemId: number) {
    this.inventoryService.sellItem(itemId).subscribe(() => this.loadInventory());
  }
}
