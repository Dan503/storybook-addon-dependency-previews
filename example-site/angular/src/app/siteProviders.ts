import { provideRouter } from '@angular/router';
import { applicationConfig } from '@storybook/angular';
import { routes } from './app.routes';

// Single source of truth for app-wide providers
export const siteProviders = [provideRouter(routes)];

// Decorator for any story that needs site providers (without visual wrapping)
export const withSiteProviders = [applicationConfig({ providers: siteProviders })];
