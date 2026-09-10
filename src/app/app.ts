import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SimpleSliderComponent, ISliderPhoto } from 'simple-slider';

@Component({
  selector: 'app-root',
  imports: [SimpleSliderComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  protected readonly photos: ISliderPhoto[] = Array.from({ length: 20 }, (_, i) => ({
    url: `https://picsum.photos/id/${i + 1}/200/300`,
    name: `Photo ${i + 1}`,
    alt: `Photo ${i + 1}`,
  }));

  protected readonly mixedPhotos: ISliderPhoto[] = [
    { url: 'https://picsum.photos/id/1/200/300', name: 'Mountain', alt: 'Mountain landscape' },
    { url: 'https://picsum.photos/id/15/200/300', name: 'River', alt: 'River view', disabled: true },
    { url: 'https://picsum.photos/id/28/200/300', name: 'Forest', alt: 'Forest path' },
    { url: 'https://picsum.photos/id/36/200/300', name: 'Desert', alt: 'Desert sand' },
    { url: 'https://picsum.photos/id/42/200/300', name: 'City', alt: 'City lights' },
  ];

  protected selectedIndices: number[] = Array(8).fill(0);

  onSelect(sliderIndex: number, photoIndex: number): void {
    this.selectedIndices[sliderIndex] = photoIndex;
  }
}
