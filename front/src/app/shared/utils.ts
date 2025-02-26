import { Character, Item } from "../core/models/character.models";
import { ShopService } from "../core/services/shop.service";


// Método para calcular el tiempo restante en minutos
export function getRemainingTime(startTime:Date,duration:number): number {
    const now = new Date();
    const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 60000);
    return Math.max(duration - elapsed, 0);
}


export const unidades = (item: Item | null | undefined): string => { 
    return item?.stock !== undefined ? item.stock.toString() : "";
};

  