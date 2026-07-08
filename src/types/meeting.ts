export type Attendee = {
  id: string;
  name: string;
  initial: string;
  role: string;
  required: boolean;
  color: "primary" | "muted" | "secondary";
};

export type MeetingDraft = {
  id: string;
  title: string;
  durationMinutes: number;
  timezone: string;
  attendeeIds: string[];
};

export type ChatMessage = {
  id: string;
  author: string;
  initial: string;
  time: string;
  message: string[];
  color: "primary" | "muted" | "secondary";
};

export type MeetingCreateMock = {
  title: string;
  attendeesLabel: string;
  dateRange: string;
  timeCount: string;
  requiredAttendees: string;
  deadline: string;
  reminderText: string;
  selectedReminder: string;
};
