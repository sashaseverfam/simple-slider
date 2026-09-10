import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { SimpleSliderComponent } from 'simple-slider';

@Component({
  selector: 'app-root',
  imports: [SimpleSliderComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  protected readonly title = signal('slider');

  protected readonly photos = Array.from({ length: 20 }, (_, i) => ({
    url: `https://picsum.photos/id/${i + 1}/200/300`,
    name: `Photo ${i + 1}`,
    alt: `Photo ${i + 1}`,
  }));

  protected selectedIndex = 0;

  onSelect(index: number): void {
    this.selectedIndex = index;
  }
}
