import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { MeetingFlowProvider } from "@/context/MeetingFlowContext";
import { router } from "@/routes";
import "@/styles/globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MeetingFlowProvider>
      <RouterProvider router={router} />
    </MeetingFlowProvider>
  </StrictMode>,
);
