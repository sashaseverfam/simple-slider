import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleSliderComponent } from './simple-slider.component';
import { WINDOW } from './providers/window.providers';

describe('SimpleSlider', () => {
  let component: SimpleSliderComponent;
  let fixture: ComponentFixture<SimpleSliderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimpleSliderComponent],
      providers: [
        {
          provide: WINDOW,
          useValue: window,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SimpleSliderComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
