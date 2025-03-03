import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'secondsToTimer',
})
export class SecondsToTimerPipe implements PipeTransform {
  transform(value: number): string {
    const minutes: number = Math.floor(value / 60);
    const seconds: number = value % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}
