import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "@/layouts/RootLayout";
import { HomePage } from "@/pages/HomePage";
import { MeetingCandidateSelectPage } from "@/pages/MeetingCandidateSelectPage";
import { MeetingCreatePage } from "@/pages/MeetingCreatePage";
import { MeetingInvitePage } from "@/pages/MeetingInvitePage";
import { MeetingRequestedPage } from "@/pages/MeetingRequestedPage";
import { MeetingMySchedulePage } from "@/pages/MeetingSchedulePage";
import { ResponseStatusPage } from "@/pages/ResponseStatusPage";
import { SidebarPlaceholderPage } from "@/pages/SidebarPlaceholderPage";

const upcomingMeetings = [
  {
    title: "디자인 리뷰 회의",
    meta: "오늘 오후 3:00 · 디자인팀",
    status: "예정",
  },
  {
    title: "프로토타입 점검",
    meta: "내일 오전 10:00 · 제품팀",
    status: "예정",
  },
  {
    title: "개발 핸드오프",
    meta: "7/12 (일) 오후 2:00 · 개발팀",
    status: "예정",
  },
];

const confirmedMeetings = [
  {
    title: "리뷰회의",
    meta: "7/10 (금) 오후 6:00 · 참여자 6명",
    status: "확정됨",
  },
];

const pastMeetings = [
  {
    title: "킥오프 회의",
    meta: "7/2 (목) 오후 2:00 · 완료",
    status: "지난 회의",
  },
  {
    title: "IA 검토 회의",
    meta: "7/4 (토) 오전 11:00 · 완료",
    status: "지난 회의",
  },
];

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
        path: "my-schedule",
        element: (
          <SidebarPlaceholderPage
            cards={upcomingMeetings}
            description="다가오는 회의를 확인합니다."
            showAddSchedule
            title="내 일정"
          />
        ),
      },
      {
        path: "meetings/confirmed",
        element: (
          <SidebarPlaceholderPage
            cards={confirmedMeetings}
            description="확정된 회의를 확인합니다."
            title="확정됨"
          />
        ),
      },
      {
        path: "meetings/past",
        element: (
          <SidebarPlaceholderPage
            cards={pastMeetings}
            description="지난 회의 기록을 확인합니다."
            title="지난 회의"
          />
        ),
      },
      {
        path: "channels/notice",
        element: (
          <SidebarPlaceholderPage
            description="공지 채널"
            empty
            title="공지"
          />
        ),
      },
      {
        path: "channels/development",
        element: (
          <SidebarPlaceholderPage
            description="개발팀 채널"
            empty
            title="개발팀"
          />
        ),
      },
      {
        path: "channels/pm",
        element: (
          <SidebarPlaceholderPage description="PM 채널" empty title="PM" />
        ),
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
