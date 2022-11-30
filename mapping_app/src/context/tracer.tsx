import { ConsoleSpanExporter, SimpleSpanProcessor, WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import { ZoneContextManager } from "@opentelemetry/context-zone";
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { Resource } from '@opentelemetry/resources';
import {createContext, ReactElement} from "react";

const fetchInstrumentation = new FetchInstrumentation({
  propagateTraceHeaderCorsUrls: new RegExp(/mapping.staging.exactlylabs.com/),
  clearTimingResources: true,
});

const provider = new WebTracerProvider({
    resource: new Resource({"service.name": "Frontend"})
  }
);

provider.register({
  contextManager: new ZoneContextManager(),
});

fetchInstrumentation.setTracerProvider(provider);
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));

/**
 * Custom context provider to expose tracing tooling application-wide
 * and prevent prop-drilling.
 * By exposing the context on our App.jsx, custom hooks can pull the
 * trace tools at any given time.
 * @type {React.Context<{}>}
 */
export const TracingContext = createContext({provider});

interface TracingContextProviderProps {
  children?: ReactElement;
}

export const TracingContextProvider = ({ children }: TracingContextProviderProps) => {
  return (
    <TracingContext.Provider value={{provider: provider}}>
      {children}
    </TracingContext.Provider>
  )
}

export default TracingContext;