import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { Resource } from '@opentelemetry/resources';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { ATTR_SERVICE_NAME, ATTR_DEPLOYMENT_ENVIRONMENT } from '@opentelemetry/semantic-conventions';
import { environment } from './environments/environment';

const collectorUrl =
  (window as Window & { __TRACE_COLLECTOR__?: string }).__TRACE_COLLECTOR__ ||
  'http://localhost:4318/v1/traces';

const resource = Resource.default().merge(
  new Resource({
    [ATTR_SERVICE_NAME]: 'arogya-vault-web',
    [ATTR_DEPLOYMENT_ENVIRONMENT]: environment.production ? 'production' : 'development',
  })
);

const provider = new WebTracerProvider({
  resource: resource,
});

provider.addSpanProcessor(
  new BatchSpanProcessor(
    new OTLPTraceExporter({
      url: collectorUrl,
    })
  )
);

// Register before app bootstrap so router and HTTP calls are traced automatically.
provider.register({ contextManager: new ZoneContextManager() });

registerInstrumentations({
  instrumentations: [
    getWebAutoInstrumentations({
      '@opentelemetry/instrumentation-xml-http-request': {
        ignoreUrls: [/\/sockjs-node/],
      },
      '@opentelemetry/instrumentation-fetch': {
        ignoreUrls: [/\/sockjs-node/],
      },
    }),
  ],
});
