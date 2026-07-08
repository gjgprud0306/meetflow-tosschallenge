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
  attendeeIds: string[];
  requiredAttendeeIds: string[];
  dateRangeId: string;
  customDateRange: string;
  timeIds: string[];
  customTimeOptions: SelectOption[];
  deadlineId: string;
  reminderEnabled: boolean;
  unansweredOnly: boolean;
  reminderId: string;
  customReminderHours: string;
};

export type SelectOption = {
  id: string;
  label: string;
};

export type MeetingCreateOptions = {
  dateRanges: SelectOption[];
  candidateTimes: SelectOption[];
  deadlines: SelectOption[];
  reminders: SelectOption[];
};
