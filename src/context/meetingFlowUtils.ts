import { attendees, meetingCreateOptions } from "@/mocks";
import type { MeetingCreateMock, SelectOption } from "@/types/meeting";

const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

function optionLabel(
  options: { id: string; label: string }[],
  selectedId: string,
) {
  return options.find((option) => option.id === selectedId)?.label ?? "";
}

function shortName(name: string) {
  return name.length > 2 ? name.slice(-2) : name;
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

  if (matches.length < 2) return null;

  const start = new Date(2026, Number(matches[0][1]) - 1, Number(matches[0][2]));
  const end = new Date(2026, Number(matches[1][1]) - 1, Number(matches[1][2]));

  return { start, end };
}

function getDateRangeStartDate(meeting: MeetingCreateMock) {
  return getDateRangeDates(meeting)?.start ?? null;
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
  const startDate = getDateRangeStartDate(meeting);

  if (!startDate) return [];

  return [-3, -2, -1].flatMap((offset) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + offset);
    const times = offset === -3 ? ["18:00"] : ["12:00", "18:00"];

    return times.map((time) => {
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const weekday = weekdays[date.getDay()];

      return {
        id: `deadline-${month}-${day}-${time.replace(":", "")}`,
        label: `${month}/${day} (${weekday}) ${time}`,
      };
    });
  });
}

export function createMeetingSummaries(meeting: MeetingCreateMock) {
  const candidateTimes = [
    ...createCandidateTimeOptions(meeting),
    ...meeting.customTimeOptions,
  ];
  const firstRequired = attendees.find(
    (attendee) => attendee.id === meeting.requiredAttendeeIds[0],
  );
  const deadlineOptions = createDeadlineOptions(meeting);
  const deadline =
    optionLabel(deadlineOptions, meeting.deadlineId) ||
    (meeting.deadlineId === "custom-deadline" ? meeting.customDeadline : "");
  const reminder = optionLabel(
    meetingCreateOptions.reminders,
    meeting.reminderId,
  ) || (meeting.customReminderHours ? `마감 ${meeting.customReminderHours}시간 전` : "");
  const selectedTimes = meeting.timeIds
    .map((id) => optionLabel(candidateTimes, id))
    .filter(Boolean)
    .join(", ");

  return {
    attendeesLabel: `${meeting.attendeeIds.length}명 선택`,
    requiredLabel:
      meeting.requiredAttendeeIds.length > 1
        ? attendees
            .filter((attendee) =>
              meeting.requiredAttendeeIds.includes(attendee.id),
            )
            .map((attendee) => shortName(attendee.name))
            .join(", ")
        : (firstRequired ? shortName(firstRequired.name) : "선택 없음"),
    dateRange:
      meeting.dateRangeId === "custom-date-range"
        ? meeting.customDateRange
        : optionLabel(meetingCreateOptions.dateRanges, meeting.dateRangeId) ||
          "후보 기간 선택",
    timeCount: `${meeting.timeIds.length}개 선택`,
    selectedTimes,
    deadline: deadline || "응답 마감 선택",
    reminder,
    reminderText: meeting.reminderEnabled
      ? reminder && deadline
        ? `${meeting.unansweredOnly ? "미응답자에게" : "참석자에게"} ${reminder}에 자동 리마인드를 보냅니다. (마감: ${deadline})`
        : "리마인드 시간을 선택해주세요."
      : "자동 리마인드를 사용하지 않습니다.",
  };
}
