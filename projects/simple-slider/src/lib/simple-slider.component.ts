import {
  afterNextRender,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  output,
  ViewChild,
} from '@angular/core';
import { WINDOW, WINDOW_PROVIDERS } from './providers/window.providers';
import {
  debounceTime,
  fromEvent,
  startWith,
  Subscription,
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
export class SimpleSliderComponent implements AfterViewInit, OnDestroy {
  private readonly window = inject(WINDOW);

  private readonly cdr = inject(ChangeDetectorRef);

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

  @ViewChild('propertyPhotoSlider', { static: false, read: ElementRef })
  propertyPhotoSlider?: ElementRef;
  @ViewChild('galleryUl', { static: false, read: ElementRef })
  galleryUl?: ElementRef;
  @ViewChild('arrowPrevButton', { static: false, read: ElementRef })
  arrowPrevButton?: ElementRef;
  @ViewChild('arrowNextButton', { static: false, read: ElementRef })
  arrowNextButton?: ElementRef;

  arrowPrevButtonClickDetected = false;
  arrowNextButtonClickDetected = false;

  private _propertyPhotoSlider?: HTMLDivElement;
  private _galleryUl?: HTMLDivElement;

  activeNextArrowSlider = false;
  activePrevArrowSlider = false;

  cardSliderCount = 0;
  widthGallery = 0;
  visibleArrow = false;

  startTouchCoordX = 0;
  moveTouchCoordX = 0;

  private _subs: Subscription[] = [];
  set subs(sub: Subscription) {
    this._subs.push(sub);
  }

  constructor() {
    afterNextRender(() => {
      if (this.propertyPhotoSlider) {
        this.initPropertyPhotoSlider();
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
      this.cardSliderCount = photos.length;
    }
  }, { allowSignalWrites: true });

  ngAfterViewInit() {
    if (this.galleryUl) {
      this.initGalleryUl();
      this.initWheelAction(this.galleryUl);
    }
  }

  ngOnDestroy() {
    this._subs.forEach((s) => s.unsubscribe());
  }

  public stepPrevSlider(): void {
    this.actionSlider(ESliderAction.STEPPREVSLIDER);
  }

  public stepNextSlider(): void {
    this.actionSlider(ESliderAction.STEPNEXTSLIDER);
  }

  public computedPositionSlider(): void {
    this.actionSlider(ESliderAction.COMPUTEDPOSITIONSLIDER);
  }

  private actionSlider(action: ESliderAction, touchDelta = 0): void {
    const countVisibleSlider = Math.floor(this.widthGallery / (this.cardWidth() + this.cardMargin()));

    let currentMarginLeft = parseInt(
      (this._galleryUl?.style.marginLeft as string).replace('px', ''),
      10,
    );
    currentMarginLeft = isNaN(currentMarginLeft) ? 0 : currentMarginLeft;

    let computedPositionSlider = 0;
    const maxDelta = -(this.cardWidth() + this.cardMargin()) * this.cardSliderCount + this.widthGallery;
    let positionSlider = 0;

    switch (action) {
      case ESliderAction.STEPNEXTSLIDER: {
        computedPositionSlider = currentMarginLeft - (this.cardWidth() + this.cardMargin());
        positionSlider = Math.max(computedPositionSlider, maxDelta);

        if (positionSlider < maxDelta) {
          positionSlider = maxDelta;
        }

        if (countVisibleSlider >= this.cardSliderCount) {
          positionSlider = 0;
        }

        break;
      }

      case ESliderAction.STEPPREVSLIDER: {
        computedPositionSlider = currentMarginLeft + (this.cardWidth() + this.cardMargin());
        positionSlider = Math.min(computedPositionSlider, 0);

        if (positionSlider > 0) {
          positionSlider = 0;
        }

        break;
      }

      case ESliderAction.COMPUTEDPOSITIONSLIDER: {
        computedPositionSlider = -(this.cardWidth() + this.cardMargin()) * this.selectedElementIndex();
        positionSlider = Math.max(computedPositionSlider, maxDelta);

        if (positionSlider > 0) {
          positionSlider = 0;
        }

        break;
      }

      case ESliderAction.TOUCHMOVE: {
        positionSlider = currentMarginLeft + touchDelta;

        if (positionSlider > 0) {
          positionSlider = 0;
        }

        if (positionSlider < maxDelta) {
          positionSlider = maxDelta;
        }

        if (countVisibleSlider >= this.cardSliderCount) {
          positionSlider = 0;
        }

        break;
      }
    }

    if (this._galleryUl) {
      this._galleryUl.style.marginLeft = positionSlider + 'px';
    }

    this.activePrevArrowSlider = positionSlider === 0;
    this.activeNextArrowSlider = maxDelta === positionSlider;

    this.cdr.detectChanges();
  }

  public touchStartGallery(evt: TouchEvent) {
    const countTouch = evt.touches.length;

    if (countTouch > 1) {
      return;
    }

    this.startTouchCoordX = evt.touches[0].clientX;
    this.moveTouchCoordX = this.startTouchCoordX;
  }

  public touchMoveGallery(evt: TouchEvent) {
    if (!this.visibleArrow) {
      evt.preventDefault();
    }

    const countTouch = evt.touches.length;

    if (countTouch > 1) {
      return;
    }
    const curr = evt.touches[0].clientX;
    const touchDelta = curr - this.moveTouchCoordX;

    if (Math.abs(touchDelta) > this.touchDelta()) {
      this.actionSlider(ESliderAction.TOUCHMOVE, touchDelta);
      this.moveTouchCoordX = curr;
    }
  }

  private initGalleryUl() {
    this._galleryUl = this.galleryUl?.nativeElement;
    this.widthGallery = +(this._galleryUl?.parentElement?.offsetWidth || 0);
    this.cardSliderCount = this._galleryUl?.children.length || 0;
  }

  private initWheelAction(elementRef: ElementRef) {
    this.subs = fromEvent<WheelEvent>(elementRef.nativeElement, 'wheel').subscribe(
      (e: WheelEvent) => {
        if (!this.visibleArrow) {
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

  private initPropertyPhotoSlider() {
    if (!this.window) {
      return;
    }

    this._propertyPhotoSlider = this.propertyPhotoSlider?.nativeElement;

    const resize$ = fromEvent(this.window, 'resize').pipe(
      startWith([
        this._propertyPhotoSlider?.offsetWidth,
        +(this._galleryUl?.parentElement?.offsetWidth || 0),
      ]),
      switchMap(() =>
        of([
          +(this._propertyPhotoSlider?.offsetWidth || 0),
          +(this._galleryUl?.parentElement?.offsetWidth || 0),
        ]),
      ),
    );

    this.subs = resize$
      .pipe(distinctUntilChanged(), debounceTime(100))
      .subscribe(([currentWidthPropertyPhotoSlider, galleryUloffsetWidth]) => {
        this.widthGallery = galleryUloffsetWidth;
        const count =
          (currentWidthPropertyPhotoSlider - 2 * this.arrowWidth()) /
          (this.cardWidth() + this.cardMargin());
        const countCeil = Math.ceil(count);

        this.visibleArrow = countCeil > this.cardSliderCount;
        this.computedPositionSlider();

        this.cdr.detectChanges();
      });
  }

  private initArrowPrevButtonActions() {
    if (this.arrowPrevButton) {
      this.initLongTouch(this.arrowPrevButton, EArrowAction.STEPPREVSLIDER);
      this.initLongClick(this.arrowPrevButton, EArrowAction.STEPPREVSLIDER);
    }
  }

  private initArrowNextButtonActions() {
    if (this.arrowNextButton) {
      this.initLongTouch(this.arrowNextButton, EArrowAction.STEPNEXTSLIDER);
      this.initLongClick(this.arrowNextButton, EArrowAction.STEPNEXTSLIDER);
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

    this.subs = longTouch$
      .pipe(
        switchMap(() => {
          return interval(1000).pipe(takeUntil(touchend$));
        }),
      )
      .subscribe(() => {
        switch (typeArrowAction) {
          case EArrowAction.STEPPREVSLIDER: {
            this.arrowPrevButtonClickDetected = true;
            this.stepPrevSlider();
            break;
          }
          case EArrowAction.STEPNEXTSLIDER: {
            this.arrowNextButtonClickDetected = true;
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

    this.subs = click$.subscribe(() => {
      switch (typeArrowAction) {
        case EArrowAction.STEPPREVSLIDER: {
          if (this.arrowPrevButtonClickDetected) {
            this.arrowPrevButtonClickDetected = false;
            return;
          }
          this.stepPrevSlider();
          break;
        }
        case EArrowAction.STEPNEXTSLIDER: {
          if (this.arrowNextButtonClickDetected) {
            this.arrowNextButtonClickDetected = false;
            return;
          }
          this.stepNextSlider();
          break;
        }
      }
    });

    this.subs = longClick$
      .pipe(
        switchMap(() => {
          return interval(1000).pipe(takeUntil(mouseUp$));
        }),
      )
      .subscribe(() => {
        switch (typeArrowAction) {
          case EArrowAction.STEPPREVSLIDER: {
            this.arrowPrevButtonClickDetected = true;
            this.stepPrevSlider();
            break;
          }
          case EArrowAction.STEPNEXTSLIDER: {
            this.arrowNextButtonClickDetected = true;
            this.stepNextSlider();
            break;
          }
        }
      });
  }
}
