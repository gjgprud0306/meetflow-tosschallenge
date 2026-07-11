import type {
  ChatMessage,
  MeetingCreateMock,
  MeetingCreateOptions,
  MeetingDraft,
} from "@/types/meeting";

export const meetingDrafts: MeetingDraft[] = [
  {
    id: "meetflow-kickoff",
    title: "MFlow kickoff",
    durationMinutes: 60,
    timezone: "Asia/Seoul",
    attendeeIds: ["owner", "min", "jun"],
  },
];

export const chatMessages: ChatMessage[] = [
  {
    id: "m1",
    author: "허혜경 (주최자)",
    initial: "가",
    time: "오전 10:12",
    message: ["디자인 시안 정리됐어요."],
    color: "primary",
  },
  {
    id: "m2",
    author: "윤지은",
    initial: "지",
    time: "오전 10:14",
    message: ["확인했어요."],
    color: "muted",
  },
  {
    id: "m3",
    author: "김민서",
    initial: "민",
    time: "오전 10:15",
    message: ["개발 전에 리뷰하면 좋겠네요."],
    color: "muted",
  },
  {
    id: "m4",
    author: "박준호",
    initial: "준",
    time: "오전 10:16",
    message: ["다 같이 보는 게 빠를 듯합니다."],
    color: "secondary",
  },
  {
    id: "m5",
    author: "허혜경 (주최자)",
    initial: "가",
    time: "오전 10:17",
    message: ["그럼 회의 생성해서 일정 응답 요청드릴게요."],
    color: "primary",
  },
];

export const meetingCreateIntro: ChatMessage = {
  id: "create-intro",
  author: "허혜경 (주최자)",
  initial: "가",
  time: "오전 10:17",
  message: ["그럼 회의 생성해서 일정 응답 요청드릴게요."],
  color: "primary",
};

export const meetingCreateMock: MeetingCreateMock = {
  title: "",
  attendeeIds: ["owner", "min", "jun", "seo", "ji", "eun"],
  requiredAttendeeIds: [],
  dateRangeId: "",
  customDateRange: "",
  timeIds: [],
  customTimeOptions: [],
  deadlineId: "deadline-24h",
  customDeadline: "",
  reminderEnabled: true,
  unansweredOnly: true,
  reminderId: "3h",
  reminderIds: ["3h"],
  customReminderHours: "",
  customReminderDateTime: "",
};

export const meetingCreateOptions: MeetingCreateOptions = {
  dateRanges: [
    { id: "july-7-9", label: "7/7 (화) ~ 7/9 (목)" },
    { id: "july-8-10", label: "7/8 (수) ~ 7/10 (금)" },
    { id: "july-9-11", label: "7/9 (목) ~ 7/11 (토)" },
    { id: "july-13-15", label: "7/13 (월) ~ 7/15 (수)" },
  ],
  candidateTimes: [
    { id: "mon-10", label: "월 10:00" },
    { id: "mon-14", label: "월 14:00" },
    { id: "tue-10", label: "화 10:00" },
    { id: "tue-15", label: "화 15:00" },
    { id: "wed-11", label: "수 11:00" },
    { id: "wed-14", label: "수 14:00" },
    { id: "thu-11", label: "목 11:00" },
    { id: "thu-16", label: "목 16:00" },
    { id: "fri-10", label: "금 10:00" },
    { id: "fri-15", label: "금 15:00" },
  ],
  deadlines: [],
  reminders: [
    { id: "3h", label: "마감 3시간 전" },
    { id: "1h", label: "마감 1시간 전" },
  ],
};
