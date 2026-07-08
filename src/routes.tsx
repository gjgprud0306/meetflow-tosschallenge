import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "@/layouts/RootLayout";
import { HomePage } from "@/pages/HomePage";
import { MeetingCandidateSelectPage } from "@/pages/MeetingCandidateSelectPage";
import { MeetingCreatePage } from "@/pages/MeetingCreatePage";
import { MeetingInvitePage } from "@/pages/MeetingInvitePage";
import { MeetingRequestedPage } from "@/pages/MeetingRequestedPage";
import { MeetingMySchedulePage } from "@/pages/MeetingSchedulePage";
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
        element: <MeetingMySchedulePage />,
      },
      {
        path: "meetings/candidate-select",
        element: <MeetingCandidateSelectPage />,
      },
      {
        path: "meetings/response-status",
        element: <ResponseStatusPage />,
      },
    ],
  },
]);
