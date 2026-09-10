import {
  afterNextRender,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  output,
  ViewChild,
} from '@angular/core';
import { WINDOW, WINDOW_PROVIDERS } from './providers/window.providers';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  debounceTime,
  fromEvent,
  startWith,
  switchMap,
  distinctUntilChanged,
  of,
  delay,
  takeUntil,
  interval,
} from 'rxjs';
import { EArrowAction, ESliderAction } from './enums/slider.enums';
import { ISliderPhoto } from './interfaces/slider.interface';
import { SimpleSliderPhotoComponent } from './components/simple-slider-photo/simple-slider-photo.component';

@Component({
  selector: 'lib-simple-slider',
  templateUrl: './simple-slider.component.html',
  styleUrls: ['./simple-slider.component.scss'],
  imports: [SimpleSliderPhotoComponent],
  providers: [WINDOW_PROVIDERS],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimpleSliderComponent implements AfterViewInit {
  private readonly window = inject(WINDOW);

  private readonly cdr = inject(ChangeDetectorRef);

  private readonly destroyRef = inject(DestroyRef);

  propertyPhotos = input<ISliderPhoto[]>([]);
  selectedElementIndex = input(0);
  cardWidth = input(60);
  cardHeight = input(90);
  cardMargin = input(10);
  borderWidth = input(1);
  cardPadding = input(2);
  activeBorderColor = input('#1976d2');
  defaultBorderColor = input('#fff');
  inactiveIconColor = input('#9e9e9e');
  longClickDelay = input(200);
  arrowBackgroundColor = input('transparent');
  arrowBorderColor = input('transparent');
  arrowBorderWidth = input(0);
  arrowColor = input('#333');
  touchDelta = input(20);
  arrowWidth = input(36);

  changeModel = output<number>();

  @ViewChild('sliderContainer', { static: false, read: ElementRef })
  sliderContainer?: ElementRef;
  @ViewChild('galleryTrack', { static: false, read: ElementRef })
  galleryTrack?: ElementRef;
  @ViewChild('arrowPrevButton', { static: false, read: ElementRef })
  arrowPrevButton?: ElementRef;
  @ViewChild('arrowNextButton', { static: false, read: ElementRef })
  arrowNextButton?: ElementRef;

  prevArrowLongPress = false;
  nextArrowLongPress = false;

  private _sliderContainer?: HTMLDivElement;
  private _galleryTrack?: HTMLDivElement;

  isNextArrowDisabled = false;
  isPrevArrowDisabled = false;

  photoCount = 0;
  galleryWidth = 0;
  arrowsHidden = false;

  touchStartX = 0;
  touchCurrentX = 0;

  constructor() {
    afterNextRender(() => {
      if (this.sliderContainer) {
        this.initSliderContainer();
      }

      if (this.arrowPrevButton) {
        this.initArrowPrevButtonActions();
      }

      if (this.arrowNextButton) {
        this.initArrowNextButtonActions();
      }
    });
  }

  private syncCardSliderCount = effect(() => {
    const photos = this.propertyPhotos();
    if (photos?.length) {
      this.photoCount = photos.length;
    }
  }, { allowSignalWrites: true });

  ngAfterViewInit() {
    if (this.galleryTrack) {
      this.initGalleryTrack();
      this.initWheelAction(this.galleryTrack);
    }
  }

  public stepPrevSlider(): void {
    this.actionSlider(ESliderAction.STEP_PREV);
  }

  public stepNextSlider(): void {
    this.actionSlider(ESliderAction.STEP_NEXT);
  }

  public computedPositionSlider(): void {
    this.actionSlider(ESliderAction.COMPUTE_POSITION);
  }

  private actionSlider(action: ESliderAction, touchDelta = 0): void {
    const countVisibleSlider = Math.floor(this.galleryWidth / (this.cardWidth() + this.cardMargin()));

    let currentMarginLeft = parseInt(
      (this._galleryTrack?.style.marginLeft as string).replace('px', ''),
      10,
    );
    currentMarginLeft = isNaN(currentMarginLeft) ? 0 : currentMarginLeft;

    let computedPositionSlider = 0;
    const maxDelta = -(this.cardWidth() + this.cardMargin()) * this.photoCount + this.galleryWidth;
    let positionSlider = 0;

    switch (action) {
      case ESliderAction.STEP_NEXT: {
        computedPositionSlider = currentMarginLeft - (this.cardWidth() + this.cardMargin());
        positionSlider = Math.max(computedPositionSlider, maxDelta);

        if (positionSlider < maxDelta) {
          positionSlider = maxDelta;
        }

        if (countVisibleSlider >= this.photoCount) {
          positionSlider = 0;
        }

        break;
      }

      case ESliderAction.STEP_PREV: {
        computedPositionSlider = currentMarginLeft + (this.cardWidth() + this.cardMargin());
        positionSlider = Math.min(computedPositionSlider, 0);

        if (positionSlider > 0) {
          positionSlider = 0;
        }

        break;
      }

      case ESliderAction.COMPUTE_POSITION: {
        computedPositionSlider = -(this.cardWidth() + this.cardMargin()) * this.selectedElementIndex();
        positionSlider = Math.max(computedPositionSlider, maxDelta);

        if (positionSlider > 0) {
          positionSlider = 0;
        }

        break;
      }

      case ESliderAction.TOUCH_MOVE: {
        positionSlider = currentMarginLeft + touchDelta;

        if (positionSlider > 0) {
          positionSlider = 0;
        }

        if (positionSlider < maxDelta) {
          positionSlider = maxDelta;
        }

        if (countVisibleSlider >= this.photoCount) {
          positionSlider = 0;
        }

        break;
      }
    }

    if (this._galleryTrack) {
      this._galleryTrack.style.marginLeft = positionSlider + 'px';
    }

    this.isPrevArrowDisabled = positionSlider === 0;
    this.isNextArrowDisabled = maxDelta === positionSlider;

    this.cdr.detectChanges();
  }

  public touchStartGallery(evt: TouchEvent) {
    const countTouch = evt.touches.length;

    if (countTouch > 1) {
      return;
    }

    this.touchStartX = evt.touches[0].clientX;
    this.touchCurrentX = this.touchStartX;
  }

  public touchMoveGallery(evt: TouchEvent) {
    if (!this.arrowsHidden) {
      evt.preventDefault();
    }

    const countTouch = evt.touches.length;

    if (countTouch > 1) {
      return;
    }
    const curr = evt.touches[0].clientX;
    const touchDelta = curr - this.touchCurrentX;

    if (Math.abs(touchDelta) > this.touchDelta()) {
      this.actionSlider(ESliderAction.TOUCH_MOVE, touchDelta);
      this.touchCurrentX = curr;
    }
  }

  private initGalleryTrack() {
    this._galleryTrack = this.galleryTrack?.nativeElement;
    this.galleryWidth = +(this._galleryTrack?.parentElement?.offsetWidth || 0);
    this.photoCount = this._galleryTrack?.children.length || 0;
  }

  private initWheelAction(elementRef: ElementRef) {
    fromEvent<WheelEvent>(elementRef.nativeElement, 'wheel')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
      (e: WheelEvent) => {
        if (!this.arrowsHidden) {
          e.preventDefault();
        }
        const delta = e.deltaY;
        if (delta > 0) {
          this.stepNextSlider();
        } else if (delta < 0) {
          this.stepPrevSlider();
        }
      },
    );
  }

  private initSliderContainer() {
    if (!this.window) {
      return;
    }

    this._sliderContainer = this.sliderContainer?.nativeElement;

    const resize$ = fromEvent(this.window, 'resize').pipe(
      startWith([
        this._sliderContainer?.offsetWidth,
        +(this._galleryTrack?.parentElement?.offsetWidth || 0),
      ]),
      switchMap(() =>
        of([
          +(this._sliderContainer?.offsetWidth || 0),
          +(this._galleryTrack?.parentElement?.offsetWidth || 0),
        ]),
      ),
    );

    resize$
      .pipe(distinctUntilChanged(), debounceTime(100), takeUntilDestroyed(this.destroyRef))
      .subscribe(([currentWidthPropertyPhotoSlider, galleryUloffsetWidth]) => {
        this.galleryWidth = galleryUloffsetWidth;
        const count =
          (currentWidthPropertyPhotoSlider - 2 * this.arrowWidth()) /
          (this.cardWidth() + this.cardMargin());
        const countCeil = Math.ceil(count);

        this.arrowsHidden = countCeil > this.photoCount;
        this.computedPositionSlider();

        this.cdr.detectChanges();
      });
  }

  private initArrowPrevButtonActions() {
    if (this.arrowPrevButton) {
      this.initLongTouch(this.arrowPrevButton, EArrowAction.STEP_PREV);
      this.initLongClick(this.arrowPrevButton, EArrowAction.STEP_PREV);
    }
  }

  private initArrowNextButtonActions() {
    if (this.arrowNextButton) {
      this.initLongTouch(this.arrowNextButton, EArrowAction.STEP_NEXT);
      this.initLongClick(this.arrowNextButton, EArrowAction.STEP_NEXT);
    }
  }

  private initLongTouch(elementRef: ElementRef, typeArrowAction: EArrowAction) {
    const touchstart$ = fromEvent(elementRef.nativeElement, 'touchstart');
    const touchend$ = fromEvent(elementRef.nativeElement, 'touchend');

    const longTouch$ = touchstart$.pipe(
      switchMap((v) => {
        return of(v).pipe(delay(this.longClickDelay()), takeUntil(touchend$));
      }),
    );

    longTouch$
      .pipe(
        switchMap(() => {
          return interval(1000).pipe(takeUntil(touchend$));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        switch (typeArrowAction) {
          case EArrowAction.STEP_PREV: {
            this.prevArrowLongPress = true;
            this.stepPrevSlider();
            break;
          }
          case EArrowAction.STEP_NEXT: {
            this.nextArrowLongPress = true;
            this.stepNextSlider();
            break;
          }
        }
      });
  }

  private initLongClick(elementRef: ElementRef, typeArrowAction: EArrowAction) {
    const mouseUp$ = fromEvent(elementRef.nativeElement, 'mouseup');
    const mouseDown$ = fromEvent(elementRef.nativeElement, 'mousedown');
    const click$ = fromEvent(elementRef.nativeElement, 'click');

    const longClick$ = mouseDown$.pipe(
      switchMap((v) => {
        return of(v).pipe(delay(this.longClickDelay()), takeUntil(mouseUp$));
      }),
    );

    click$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      switch (typeArrowAction) {
        case EArrowAction.STEP_PREV: {
          if (this.prevArrowLongPress) {
            this.prevArrowLongPress = false;
            return;
          }
          this.stepPrevSlider();
          break;
        }
        case EArrowAction.STEP_NEXT: {
          if (this.nextArrowLongPress) {
            this.nextArrowLongPress = false;
            return;
          }
          this.stepNextSlider();
          break;
        }
      }
    });

    longClick$
      .pipe(
        switchMap(() => {
          return interval(1000).pipe(takeUntil(mouseUp$));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        switch (typeArrowAction) {
          case EArrowAction.STEP_PREV: {
            this.prevArrowLongPress = true;
            this.stepPrevSlider();
            break;
          }
          case EArrowAction.STEP_NEXT: {
            this.nextArrowLongPress = true;
            this.stepNextSlider();
            break;
          }
        }
      });
  }
}
