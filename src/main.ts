// Polyfill for libraries relying on 'global' - MUST be first!
interface WindowWithGlobal {
  global: typeof globalThis;
}
(window as unknown as WindowWithGlobal).global = window;

// Initialize OpenTelemetry tracing before Angular bootstraps.
// Commented out temporarily due to type issues with @opentelemetry/resources
// import './tracing';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
