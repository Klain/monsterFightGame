import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatMoney',
})
export class formatMoney implements PipeTransform {
  transform(money: number): string {
    const gold = Math.floor(money / (100 * 100 ));
    const silver = Math.floor((money % (100 * 100)) / (100));
    const copper = Math.floor((money % (100 * 100)) % (100 ));
    return `${gold.toString().padStart(2, '0')}g ${silver.toString().padStart(2, '0')}s ${copper.toString().padStart(2, '0')}c`;
  }
}