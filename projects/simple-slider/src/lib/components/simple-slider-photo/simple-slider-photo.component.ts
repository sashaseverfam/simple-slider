import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'simple-slider-photo',
  templateUrl: './simple-slider-photo.component.html',
  styleUrls: ['./simple-slider-photo.component.scss'],
  imports: [NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimpleSliderPhotoComponent {
  photoLink = input<string | SafeResourceUrl>();
  photoAlt = input('');
  isActive = input(false);
  isDisabled = input(false);
  cardWidth = input(0);
  cardHeight = input(0);
  borderWidth = input(0);
  cardPadding = input(0);
  activeBorderColor = input('#1976d2');
  defaultBorderColor = input('#fff');

  changeModel = output<void>();

  get borderColor(): string {
    return this.isActive() ? this.activeBorderColor() : this.defaultBorderColor();
  }
}
