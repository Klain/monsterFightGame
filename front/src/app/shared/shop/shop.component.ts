import { Component, Input, SimpleChanges ,  OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Character, Item } from "../../core/models/character.models";
import { ItemGridComponent } from "../../shared/item-grid/item-grid.component";

@Component({
  selector: "app-shop",
  standalone: true,
  imports: [CommonModule, ItemGridComponent],
  templateUrl: "./shop.component.html",
  styleUrls: ["./shop.component.scss"],
})
export class ShopComponent implements OnInit {
  @Input() character!: Character;
  @Input() shopList: Array<Item>=[];

  @Input() rows: number = 3;
  @Input() cols: number = 3;
  @Input() height: string = '64px';
  @Input() width: string = '64px';

  @Input() charTopLeft?: (...args: any[]) => any;
  @Input() charTopRight?: (...args: any[]) => any;
  @Input() charBottomLeft?: (...args: any[]) => any;
  @Input() charBottomRight?: (...args: any[]) => any;

  @Input() shopTopLeft?: (...args: any[]) => any;
  @Input() shopTopRight?: (...args: any[]) => any;
  @Input() shopBottomLeft?: (...args: any[]) => any;
  @Input() shopBottomRight?: (...args: any[]) => any;

  @Input() charAction1?: (...args: any[]) => any;
  @Input() charAction2?: (...args: any[]) => any;
  @Input() shopAction1?: (...args: any[]) => any;
  @Input() shopAction2?: (...args: any[]) => any;

  constructor(
  ) {}

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['character'] && changes['character'].currentValue) {
      this.character = changes['character'].currentValue;
    }
    if (changes['shopList'] && changes['shopList'].currentValue) {
      this.shopList =changes['shopList'].currentValue;
    }
    if (changes['rows'] && changes['rows'].currentValue) {this.rows=changes['rows'].currentValue}
    if (changes['cols'] && changes['cols'].currentValue) {this.cols=changes['cols'].currentValue}
    if (changes['height'] && changes['height'].currentValue) {this.height=changes['height'].currentValue}
    if (changes['width'] && changes['width'].currentValue) {this.width=changes['width'].currentValue}
    if (changes['charTopLeft'] && changes['charTopLeft'].currentValue) {this.charTopLeft=changes['charTopLeft'].currentValue}
    if (changes['charTopRight'] && changes['charTopRight'].currentValue) {this.charTopRight=changes['charTopRight'].currentValue}
    if (changes['charBottomLeft'] && changes['charBottomLeft'].currentValue) {this.charBottomLeft=changes['charBottomLeft'].currentValue}
    if (changes['charBottomRight'] && changes['charBottomRight'].currentValue) {this.charBottomRight=changes['charBottomRight'].currentValue}
    if (changes['charAction1'] && changes['charAction1'].currentValue) {this.charAction1=changes['charAction1'].currentValue}
    if (changes['charAction2'] && changes['charAction2'].currentValue) {this.charAction2=changes['charAction2'].currentValue}
    if (changes['shopTopLeft'] && changes['shopTopLeft'].currentValue) {this.shopTopLeft=changes['shopTopLeft'].currentValue}
    if (changes['shopTopRight'] && changes['shopTopRight'].currentValue) {this.shopTopRight=changes['shopTopRight'].currentValue}
    if (changes['shopBottomLeft'] && changes['shopBottomLeft'].currentValue) {this.shopBottomLeft=changes['shopBottomLeft'].currentValue}
    if (changes['shopBottomRight'] && changes['shopBottomRight'].currentValue) {this.shopBottomRight=changes['shopBottomRight'].currentValue}
    if (changes['shopAction1'] && changes['shopAction1'].currentValue) {this.shopAction1=changes['shopAction1'].currentValue}
    if (changes['shopAction2'] && changes['shopAction2'].currentValue) {this.shopAction2=changes['shopAction2'].currentValue}
  }
}
