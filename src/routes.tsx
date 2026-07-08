import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "@/layouts/RootLayout";
import { HomePage } from "@/pages/HomePage";
import { MeetingCreatePage } from "@/pages/MeetingCreatePage";
import { MeetingRequestedPage } from "@/pages/MeetingRequestedPage";
import { ResponseStatusPage } from "@/pages/ResponseStatusPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "meetings/new",
        element: <MeetingCreatePage />,
      },
      {
        path: "meetings/requested",
        element: <MeetingRequestedPage />,
      },
      {
        path: "meetings/response-status",
        element: <ResponseStatusPage />,
      },
    ],
  },
]);
