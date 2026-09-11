# Simple Slider Angular

A lightweight, configurable photo slider/gallery component for Angular with touch support, arrow navigation, and full customization via signal-based inputs.

## Installation

```bash
npm install @severfam/simple-slider-angular
```

## Requirements

- Angular 21+
- `@angular/common`
- `@angular/core`
- `@angular/platform-browser`

## Usage

### Import

```typescript
import { SimpleSliderComponent, ISliderPhoto } from '@severfam/simple-slider-angular';
```

### Component

```typescript
@Component({
  selector: 'app-root',
  imports: [SimpleSliderComponent],
  template: `
    <lib-simple-slider
      [propertyPhotos]="photos"
      [selectedElementIndex]="selectedIndex"
      [cardWidth]="100"
      [cardHeight]="150"
      (changeModel)="onSelect($event)"
    ></lib-simple-slider>
  `,
})
export class App {
  protected photos: ISliderPhoto[] = [
    { url: 'https://example.com/photo1.jpg', name: 'Photo 1', alt: 'Description' },
    { url: 'https://example.com/photo2.jpg', name: 'Photo 2', alt: 'Description' },
  ];

  protected selectedIndex = 0;

  onSelect(index: number): void {
    this.selectedIndex = index;
  }
}
```

## API Reference

### Interface: `ISliderPhoto`

```typescript
interface ISliderPhoto {
  url: string | SafeResourceUrl;
  name: string;
  alt: string;
  disabled?: boolean;
}
```

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `url` | `string \| SafeResourceUrl` | Yes | URL of the photo |
| `name` | `string` | Yes | Display name of the photo |
| `alt` | `string` | Yes | Alt text for accessibility |
| `disabled` | `boolean` | No | If true, the photo cannot be selected |

### Inputs

#### Data

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `propertyPhotos` | `ISliderPhoto[]` | `[]` | Array of photos to display |
| `selectedElementIndex` | `number` | `0` | Index of the currently selected photo |

#### Card Dimensions

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `cardWidth` | `number` | `60` | Width of each photo card in pixels |
| `cardHeight` | `number` | `90` | Height of each photo card in pixels |
| `cardMargin` | `number` | `10` | Horizontal margin between cards in pixels |
| `cardPadding` | `number` | `2` | Padding inside each card in pixels |
| `borderWidth` | `number` | `1` | Border width of each card in pixels |

#### Colors

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `activeBorderColor` | `string` | `'#1976d2'` | Border color for the selected photo |
| `defaultBorderColor` | `string` | `'#fff'` | Border color for non-selected photos |
| `arrowColor` | `string` | `'#333'` | Color of the arrow icons |
| `inactiveIconColor` | `string` | `'#9e9e9e'` | Color of arrow icons when disabled |
| `arrowBackgroundColor` | `string` | `'transparent'` | Background color of arrow buttons |
| `arrowBorderColor` | `string` | `'transparent'` | Border color of arrow buttons |
| `arrowBorderWidth` | `number` | `0` | Border width of arrow buttons in pixels |

#### Behavior

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `longClickDelay` | `number` | `200` | Delay in ms before long press triggers continuous scrolling |
| `touchDelta` | `number` | `20` | Minimum horizontal movement in px to trigger a swipe |
| `arrowWidth` | `number` | `36` | Width of arrow buttons in pixels |

### Outputs

| Output | Type | Description |
|--------|------|-------------|
| `changeModel` | `number` | Emits the index of the photo when clicked |

### Public Methods

| Method | Description |
|--------|-------------|
| `stepPrevSlider()` | Navigate to the previous photo |
| `stepNextSlider()` | Navigate to the next photo |
| `computedPositionSlider()` | Recalculate slider position based on `selectedElementIndex` |

## Features

- Signal-based inputs (Angular 21+)
- Touch swipe support
- Mouse wheel navigation
- Long press on arrows for continuous scrolling
- Auto-hiding arrows when all photos are visible
- Responsive to window resize
- Configurable dimensions, colors, and behavior
- Lightweight with no external dependencies
