import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
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
  @Input() photoLink?: string | SafeResourceUrl;
  @Input() isActive = false;
  @Input() isDisabled = false;
  @Input() cardWidth = 0;
  @Input() cardHeight = 0;
  @Input() borderWidth = 0;
  @Input() cardPadding = 0;

  @Output() changeModel: EventEmitter<void> = new EventEmitter();
}
