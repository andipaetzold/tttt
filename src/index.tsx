import "./polyfills";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./components/App";
import "bootstrap/dist/css/bootstrap.min.css";
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";

Sentry.init({
    dsn: "https://51f308cc68f84d17a534fbd3e08610c9@o260685.ingest.sentry.io/5685762",
    integrations: [new Integrations.BrowserTracing()],
    tracesSampleRate: 1.0,
    enabled: process.env.NODE_ENV === "production",
});

const container = document.getElementById("root")!;
const root = createRoot(container);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
