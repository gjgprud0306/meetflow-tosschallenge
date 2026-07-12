import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "@/layouts/RootLayout";
import { HomePage } from "@/pages/HomePage";
import { MeetingCandidateSelectPage } from "@/pages/MeetingCandidateSelectPage";
import { MeetingCreatePage } from "@/pages/MeetingCreatePage";
import { MeetingInvitePage } from "@/pages/MeetingInvitePage";
import { MeetingRequestedPage } from "@/pages/MeetingRequestedPage";
import { ReceivedRequestsPage } from "@/pages/ReceivedRequestsPage";
import { MeetingMySchedulePage } from "@/pages/MeetingSchedulePage";
import { ResponseStatusPage } from "@/pages/ResponseStatusPage";
import { SidebarPlaceholderPage } from "@/pages/SidebarPlaceholderPage";
import {
  ownerCalendarSchedules,
  receivedReviewMeetingCalendarSchedule,
  slotById,
} from "@/context/availabilityUtils";
import type { ChatMessage } from "@/types/meeting";

const upcomingMeetings = [
  ...ownerCalendarSchedules,
  receivedReviewMeetingCalendarSchedule,
];

const confirmedMeetings = [
  {
    title: "리뷰회의",
    meta: `${slotById("slot-7-15-15").label} · 참여자 6명`,
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

const noticeMessages: ChatMessage[] = [
  {
    id: "notice-1",
    author: "MFlow Bot",
    color: "primary",
    initial: "M",
    message: [
      "오늘 오후 디자인 리뷰 회의가 예정되어 있습니다. 참석 대상자는 회의 전 최신 시안을 확인해주세요.",
    ],
    time: "오전 9:10",
  },
  {
    id: "notice-2",
    author: "MFlow Bot",
    color: "primary",
    initial: "M",
    message: [
      "신규 회의 응답 요청이 발송되었습니다. 마감 전까지 가능한 시간을 선택해주세요.",
    ],
    time: "오전 10:30",
  },
  {
    id: "notice-3",
    author: "QA팀",
    color: "muted",
    initial: "Q",
    message: [
      "QA 일정은 금요일 13:00부터 진행됩니다. 확인이 필요한 화면은 오늘 중으로 정리 부탁드립니다.",
    ],
    time: "오전 11:05",
  },
  {
    id: "notice-4",
    author: "개발팀",
    color: "secondary",
    initial: "개",
    message: [
      "개발 전달 범위가 업데이트되었습니다. 컴포넌트 상태값과 예외 케이스를 함께 확인해주세요.",
    ],
    time: "오후 1:20",
  },
  {
    id: "notice-5",
    author: "MFlow Bot",
    color: "primary",
    initial: "M",
    message: [
      "회의 자료가 업데이트되었습니다. 리뷰 회의 전 공유 문서의 마지막 섹션을 확인해주세요.",
    ],
    time: "오후 2:40",
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
            description="등록된 일정을 확인하세요."
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
            title="회의 확정"
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
            description=""
            messages={noticeMessages}
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
        path: "requests/received",
        element: <ReceivedRequestsPage />,
      },
      {
        path: "requests/invite",
        element: <MeetingInvitePage />,
      },
      {
        path: "requests/my-schedule",
        element: <MeetingMySchedulePage />,
      },
      {
        path: "requests/candidate-select",
        element: <MeetingCandidateSelectPage />,
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
