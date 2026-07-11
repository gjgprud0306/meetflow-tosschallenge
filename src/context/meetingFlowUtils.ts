import { attendees, meetingCreateOptions } from "@/mocks";
import type { MeetingCreateMock, SelectOption } from "@/types/meeting";

const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

function optionLabel(
  options: { id: string; label: string }[],
  selectedId: string,
) {
  return options.find((option) => option.id === selectedId)?.label ?? "";
}

function getDateRangeLabel(meeting: MeetingCreateMock) {
  if (meeting.dateRangeId === "custom-date-range") {
    return meeting.customDateRange;
  }

  return optionLabel(meetingCreateOptions.dateRanges, meeting.dateRangeId);
}

function getDateRangeDates(meeting: MeetingCreateMock) {
  const label = getDateRangeLabel(meeting);
  const matches = [...label.matchAll(/(\d{1,2})\/(\d{1,2})/g)];

  if (matches.length < 1) return null;

  const start = new Date(2026, Number(matches[0][1]) - 1, Number(matches[0][2]));
  const endMatch = matches[1] ?? matches[0];
  const end = new Date(2026, Number(endMatch[1]) - 1, Number(endMatch[2]));

  return { start, end };
}

function formatDateTimeOption(date: Date, time: string) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = weekdays[date.getDay()];

  return {
    id: `time-${month}-${day}-${time.replace(":", "")}`,
    label: `${month}/${day} (${weekday}) ${time}`,
  };
}

function deadlineDateFromMeeting(meeting: MeetingCreateMock) {
  const hoursByDeadlineId: Record<string, number> = {
    "deadline-6h": 6,
    "deadline-12h": 12,
    "deadline-24h": 24,
  };
  const relativeHours = hoursByDeadlineId[meeting.deadlineId];

  if (relativeHours) {
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + relativeHours);

    return deadline;
  }

  if (meeting.deadlineId === "custom-deadline" && meeting.customDeadline) {
    const parsed = new Date(meeting.customDeadline);

    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
}

function reminderHoursFromId(reminderId: string) {
  const match = reminderId.match(/^(\d+)h$/);

  return match ? Number(match[1]) : null;
}

function validReminderLabels(meeting: MeetingCreateMock) {
  const deadlineDate = deadlineDateFromMeeting(meeting);
  const now = new Date();
  const labels = (meeting.reminderIds.length > 0
    ? meeting.reminderIds
    : meeting.reminderId
      ? [meeting.reminderId]
      : []
  )
    .map((id) => {
      const option = meetingCreateOptions.reminders.find((item) => item.id === id);
      const hours = reminderHoursFromId(id);

      if (!option || hours === null || !deadlineDate) return option?.label ?? "";

      const sendAt = new Date(deadlineDate);
      sendAt.setHours(sendAt.getHours() - hours);

      return sendAt > now && sendAt < deadlineDate ? option.label : "";
    })
    .filter(Boolean);

  if (meeting.reminderIds.includes("custom-reminder") && meeting.customReminderDateTime) {
    const customDate = new Date(meeting.customReminderDateTime);

    if (
      deadlineDate &&
      !Number.isNaN(customDate.getTime()) &&
      customDate > now &&
      customDate < deadlineDate
    ) {
      labels.push("직접 입력");
    }
  }

  return labels;
}

function timesForWeekday(weekday: number) {
  if (weekday === 1) return ["10:00", "14:00"];
  if (weekday === 2) return ["10:00", "15:00"];
  if (weekday === 3) return ["11:00", "14:00"];
  if (weekday === 4) return ["11:00", "16:00"];
  if (weekday === 5) return ["10:00", "15:00"];
  return ["10:00", "14:00"];
}

export function createCandidateTimeOptions(
  meeting: MeetingCreateMock,
): SelectOption[] {
  const range = getDateRangeDates(meeting);

  if (!range) return [];

  const options: SelectOption[] = [];
  const current = new Date(range.start);

  while (current.getTime() <= range.end.getTime()) {
    timesForWeekday(current.getDay()).forEach((time) => {
      options.push(formatDateTimeOption(current, time));
    });
    current.setDate(current.getDate() + 1);
  }

  return options;
}

export function createDeadlineOptions(meeting: MeetingCreateMock): SelectOption[] {
  void meeting;

  const now = new Date();
  const relativeOptions = [
    { hours: 6, id: "deadline-6h", label: "6시간 후" },
    { hours: 12, id: "deadline-12h", label: "12시간 후" },
    { hours: 24, id: "deadline-24h", label: "24시간 후" },
  ];

  return relativeOptions.map((option) => {
    const deadline = new Date(now);
    deadline.setHours(deadline.getHours() + option.hours);

    const month = deadline.getMonth() + 1;
    const day = deadline.getDate();
    const weekday = weekdays[deadline.getDay()];
    const hours = deadline.getHours().toString().padStart(2, "0");
    const minutes = deadline.getMinutes().toString().padStart(2, "0");

    return {
      id: option.id,
      label: `${option.label} · ${month}/${day} (${weekday}) ${hours}:${minutes}`,
    };
  });
}

export function createMeetingSummaries(meeting: MeetingCreateMock) {
  const candidateTimes = meeting.customTimeOptions;
  const selectedAttendees = attendees.filter((attendee) =>
    meeting.attendeeIds.includes(attendee.id),
  );
  const requiredAttendees = selectedAttendees.filter((attendee) =>
    meeting.requiredAttendeeIds.includes(attendee.id),
  );
  const optionalCount = selectedAttendees.length - requiredAttendees.length;
  const deadlineOptions = createDeadlineOptions(meeting);
  const deadline =
    optionLabel(deadlineOptions, meeting.deadlineId) ||
    (meeting.deadlineId === "custom-deadline" ? meeting.customDeadline : "");
  const reminderLabels = validReminderLabels(meeting);
  const reminder = reminderLabels.join(", ");
  const selectedTimes = meeting.timeIds
    .map((id) => optionLabel(candidateTimes, id))
    .filter(Boolean)
    .join(", ");

  return {
    attendeesLabel: `${meeting.attendeeIds.length}명 선택`,
    requiredLabel: `필수 ${requiredAttendees.length}명 · 선택 ${optionalCount}명`,
    dateRange:
      meeting.dateRangeId === "custom-date-range"
        ? meeting.customDateRange
        : optionLabel(meetingCreateOptions.dateRanges, meeting.dateRangeId) ||
          "후보 날짜 선택",
    timeCount: `${meeting.timeIds.length}개 선택`,
    selectedTimes,
    deadline: deadline || "응답 마감 선택",
    reminder,
    reminderText: meeting.reminderEnabled
      ? reminder && deadline
        ? `응답하지 않은 참석자에게만 ${reminder} 리마인드를 보냅니다. (마감: ${deadline})`
        : "응답하지 않은 참석자에게만 리마인드를 보냅니다."
      : "자동 리마인드를 사용하지 않습니다.",
  };
}
