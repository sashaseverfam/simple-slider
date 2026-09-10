import { FactoryProvider, InjectionToken, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';


export const WINDOW = new InjectionToken<Window>('window');


/* eslint-disable @typescript-eslint/no-explicit-any */
const windowProvider: FactoryProvider = {
  provide: WINDOW,
  useFactory: (platformId: any) => {
    if (isPlatformBrowser(platformId)) {
      return window;
    }
    return {};
  },
  deps: [PLATFORM_ID],
};

export const WINDOW_PROVIDERS = [windowProvider];
