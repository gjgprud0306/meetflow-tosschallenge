import type { ChatMessage, MeetingCreateMock, MeetingDraft } from "@/types/meeting";

export const meetingDrafts: MeetingDraft[] = [
  {
    id: "meetflow-kickoff",
    title: "MeetFlow kickoff",
    durationMinutes: 60,
    timezone: "Asia/Seoul",
    attendeeIds: ["owner", "designer", "pm"],
  },
];

export const chatMessages: ChatMessage[] = [
  {
    id: "m1",
    author: "이가영 (주최자)",
    initial: "가",
    time: "오전 10:12",
    message: [
      "디자인 시안이 모두 정리되었습니다. 리뷰 회의를 진행하면 좋겠습니다.",
    ],
    color: "primary",
  },
  {
    id: "m2",
    author: "윤지은",
    initial: "지",
    time: "오전 10:14",
    message: ["네, 같이 검토하면 좋을 것 같아요."],
    color: "muted",
  },
  {
    id: "m3",
    author: "박은주",
    initial: "은",
    time: "오전 10:15",
    message: ["개발 시작 전에 확인하면 될 것 같습니다."],
    color: "secondary",
  },
  {
    id: "m4",
    author: "이가영 (주최자)",
    initial: "가",
    time: "오전 10:17",
    message: ["그럼 회의 생성해서 일정 응답 요청드릴게요."],
    color: "primary",
  },
];

export const meetingCreateIntro: ChatMessage = {
  id: "create-intro",
  author: "혜경",
  initial: "혜",
  time: "오전 10:12",
  message: [
    "디자인 리뷰 회의를 최대한 빨리 잡아야 합니다.",
    "가능한 시간 알려주세요.",
  ],
  color: "muted",
};

export const meetingCreateMock: MeetingCreateMock = {
  title: "리뷰회의",
  attendeesLabel: "6명 선택 · 필수 3명",
  dateRange: "7/7 (화) ~ 7/9 (목)",
  timeCount: "3개 선택",
  requiredAttendees: "혜경 외 2명",
  deadline: "7/10 (금) 18:00",
  reminderText:
    "미응답자에게 마감 3시간 전에 자동 리마인드를 보냅니다. (마감: 7/10 (금) 18:00)",
  selectedReminder: "마감 3시간 전",
};
