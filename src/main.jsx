import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { recordOpeningBloomDocumentPath } from "./lib/openingBloom.js";
import "./styles.css";

const previousDocumentPath = recordOpeningBloomDocumentPath(
  window.sessionStorage,
  window.location.pathname,
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App previousDocumentPath={previousDocumentPath} />
  </React.StrictMode>,
);
