import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import GlobalUIComponents from "./components/common/GlobalUIComponents.tsx";

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <GlobalUIComponents />
  </>
);
