import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router";

import { store } from "@/app/store";
import { ThemeProvider } from "@/features/theme/ThemeProvider";
import { Toaster } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import App from "@/App";
import "@/index.css";

createRoot(document.getElementById("root")).render(
    <Provider store={store}>
      <ThemeProvider>
        <Toaster>
          <TooltipProvider delay={250}>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </TooltipProvider>
        </Toaster>
      </ThemeProvider>
    </Provider>
);
