import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./fonts.css";
import "./index.css";
import App from "./App";
import Hero from "./Hero";
import PhoneOnly from "./PhoneOnly";
import PhonesOnly from "./PhonesOnly";

// ?view=hero, ?view=phone, or ?view=phones switches the mounted export
// target — keeps the one-off promo composites out of the main 6-panel App
// Store canvas while reusing its same components/fonts/theme.
const view = new URLSearchParams(location.search).get("view");
const View = view === "hero" ? Hero : view === "phone" ? PhoneOnly : view === "phones" ? PhonesOnly : App;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <View />
  </StrictMode>,
);
