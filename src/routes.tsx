import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "@/layouts/RootLayout";
import { HomePage } from "@/pages/HomePage";
import { MeetingCreatePage } from "@/pages/MeetingCreatePage";
import { MeetingInvitePage } from "@/pages/MeetingInvitePage";
import { MeetingRequestedPage } from "@/pages/MeetingRequestedPage";
import { MeetingSchedulePage } from "@/pages/MeetingSchedulePage";
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
        path: "meetings/invite",
        element: <MeetingInvitePage />,
      },
      {
        path: "meetings/my-schedule",
        element: <MeetingSchedulePage mode="schedule" />,
      },
      {
        path: "meetings/candidate-select",
        element: <MeetingSchedulePage mode="candidate" />,
      },
      {
        path: "meetings/response-status",
        element: <ResponseStatusPage />,
      },
    ],
  },
]);
