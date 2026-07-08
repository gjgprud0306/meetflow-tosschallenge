import { attendees, meetingCreateOptions } from "@/mocks";
import type { MeetingCreateMock } from "@/types/meeting";

function optionLabel(
  options: { id: string; label: string }[],
  selectedId: string,
) {
  return options.find((option) => option.id === selectedId)?.label ?? "";
}

export function createMeetingSummaries(meeting: MeetingCreateMock) {
  const candidateTimes = [
    ...meetingCreateOptions.candidateTimes,
    ...meeting.customTimeOptions,
  ];
  const firstRequired = attendees.find(
    (attendee) => attendee.id === meeting.requiredAttendeeIds[0],
  );
  const deadline = optionLabel(
    meetingCreateOptions.deadlines,
    meeting.deadlineId,
  );
  const reminder = optionLabel(
    meetingCreateOptions.reminders,
    meeting.reminderId,
  ) || (meeting.customReminderHours ? `마감 ${meeting.customReminderHours}시간 전` : "");
  const selectedTimes = meeting.timeIds
    .map((id) => optionLabel(candidateTimes, id))
    .filter(Boolean)
    .join(", ");

  return {
    attendeesLabel: `${meeting.attendeeIds.length}명 선택 · 필수 ${meeting.requiredAttendeeIds.length}명`,
    requiredLabel:
      meeting.requiredAttendeeIds.length > 1
        ? `${firstRequired?.name.slice(-2) ?? "혜경"} 외 ${
            meeting.requiredAttendeeIds.length - 1
          }명`
        : (firstRequired?.name ?? "선택 없음"),
    dateRange:
      meeting.dateRangeId === "custom-date-range"
        ? meeting.customDateRange
        : optionLabel(meetingCreateOptions.dateRanges, meeting.dateRangeId),
    timeCount: `${meeting.timeIds.length}개 선택`,
    selectedTimes,
    deadline,
    reminder,
    reminderText: meeting.reminderEnabled
      ? `${meeting.unansweredOnly ? "미응답자에게" : "참석자에게"} ${reminder}에 자동 리마인드를 보냅니다. (마감: ${deadline})`
      : "자동 리마인드를 사용하지 않습니다.",
  };
}
