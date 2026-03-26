import { provideRouter } from '@angular/router';
import { applicationConfig } from '@storybook/angular';

// Single source of truth for app-wide providers
export const siteProviders = [provideRouter([])];

// Decorator for any story that needs site providers (without visual wrapping)
export const withSiteProviders = [applicationConfig({ providers: siteProviders })];
