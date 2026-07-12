import { Check, ChevronRight, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AvatarBadge } from "@/components/AvatarBadge";
import { Button } from "@/components/ui/button";
import {
  getAvailabilityStatus,
  getChronologicalEligibleSlots,
  getEligibleAvailabilitySlots,
  teamRegisteredSchedules,
  type AvailabilitySlot,
} from "@/context/availabilityUtils";
import { demoDate, formatCalendarTitle } from "@/context/demoDates";
import { createDeadlineOptions } from "@/context/meetingFlowUtils";
import { useMeetingFlow } from "@/context/useMeetingFlow";
import { attendees } from "@/mocks";
import { cn } from "@/lib/utils";
import type { MeetingCreateOptions, SelectOption } from "@/types/meeting";

type MeetingCreateCardProps = {
  options: MeetingCreateOptions;
};

type ModalType =
  | "attendees"
  | "attendeeRequired"
  | "availabilityDetail"
  | "teamSchedule"
  | "dateRange"
  | "times"
  | "deadline"
  | "location"
  | null;

type FieldProps = {
  label: string;
  value: string;
  helper?: string;
  placeholder?: boolean;
  badge?: boolean;
  action?: string;
  onClick?: () => void;
};

function Field({
  label,
  value,
  helper,
  placeholder = false,
  badge = false,
  action,
  onClick,
}: FieldProps) {
  return (
    <div className="w-96">
      <div className="mb-2 flex h-5 w-[360px] items-center justify-between">
        <div className="text-[13px] font-bold leading-5 text-[#101828]">
          {label}
        </div>
        {action ? (
          <button
            className="text-xs font-medium leading-[18px] text-[#635BFF]"
            onClick={onClick}
            type="button"
          >
            {action}
          </button>
        ) : null}
        {helper ? (
          <div className="text-[11px] font-medium leading-[17px] text-[#94A3B8]">
            {helper}
          </div>
        ) : null}
      </div>
      <button
        className="flex h-12 w-[360px] items-center justify-between rounded-lg border border-[#E0E4EB] bg-[#F9FAFB] px-[17px] text-left"
        disabled={!onClick}
        onClick={onClick}
        type="button"
      >
        {badge ? (
          <span className="rounded-full bg-[#F7F6FF] px-2 py-[3px] text-xs font-bold leading-[18px] text-[#635BFF]">
            {value}
          </span>
        ) : (
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-sm font-medium leading-[21px]",
              placeholder ? "text-[#98A2B3]" : "text-[#101828]",
            )}
          >
            {value}
          </span>
        )}
        {!badge ? (
          <ChevronRight className="h-4 w-4 text-[#98A7BA]" strokeWidth={2} />
        ) : null}
      </button>
    </div>
  );
}

function TitleField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="w-96">
      <div className="mb-2 flex h-5 w-[360px] items-center justify-between">
        <div className="text-[13px] font-bold leading-5 text-[#101828]">
          1. 회의 제목 *
        </div>
      </div>
      <input
        className="flex h-12 w-[360px] items-center rounded-lg border border-[#E0E4EB] bg-[#F9FAFB] px-[17px] text-sm font-medium leading-[21px] text-[#101828] outline-none placeholder:text-[#98A2B3] focus:border-[#635BFF]"
        onChange={(event) => onChange(event.target.value)}
        placeholder="회의 제목을 입력해주세요."
        value={value}
      />
      {value.trim().length === 0 ? (
        <p className="mt-2 text-xs font-medium leading-[18px] text-[#F04438]">
          회의 제목을 입력해주세요.
        </p>
      ) : null}
    </div>
  );
}

function ReminderOption({
  label,
  selected = false,
  disabled = false,
  onClick,
}: {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "flex h-12 w-[360px] items-center gap-3 rounded-lg border px-[17px] text-left",
        selected
          ? "border-[#837CFF] bg-[#F7F6FF] text-[#837CFF]"
          : "border-[#E0E4EB] bg-[#F9FAFB] text-[#475467]",
        disabled && "opacity-45",
      )}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <span
        className={cn(
          "flex h-[18px] w-[18px] items-center justify-center rounded border",
          selected
            ? "border-[#837CFF] bg-[#837CFF] text-white"
            : "border-[#D0D5DD] bg-white text-transparent",
        )}
      >
        <Check className="h-[11px] w-[11px]" strokeWidth={3} />
      </span>
      <span className="text-sm font-medium leading-[21px]">{label}</span>
    </button>
  );
}

function ChoiceModal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101828]/20 p-6">
      <section className="flex max-h-[85vh] w-[480px] flex-col overflow-hidden rounded-xl border border-[#E0E4EB] bg-white shadow-[0_20px_60px_rgba(16,24,40,0.16)]">
        <div className="flex shrink-0 items-center justify-between px-6 pt-6">
          <h2 className="text-lg font-bold leading-7 text-[#101828]">{title}</h2>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#667085] hover:bg-[#F3F4F6]"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 px-6 pb-6 pt-5">{children}</div>
      </section>
    </div>
  );
}

const calendarWeekdays = ["일", "월", "화", "수", "목", "금", "토"];
const calendarStart = new Date(demoDate(0).getFullYear(), demoDate(0).getMonth(), 1);
const calendarEnd = new Date(demoDate(4).getFullYear(), demoDate(4).getMonth() + 1, 0);
const calendarLeadingDays = calendarStart.getDay();

const calendarCandidateDates = Array.from(
  {
    length:
      Math.round((calendarEnd.getTime() - calendarStart.getTime()) / 86400000) + 1,
  },
  (_, index) => {
    const date = new Date(calendarStart);
    date.setDate(calendarStart.getDate() + index);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekday = calendarWeekdays[date.getDay()];

    return {
      id: `date-${month}-${day}`,
      day,
      label: `${month}/${day} (${weekday})`,
      value: date,
    };
  },
);

const calendarTitle =
  demoDate(0).getFullYear() === demoDate(4).getFullYear() &&
  demoDate(0).getMonth() === demoDate(4).getMonth()
    ? formatCalendarTitle(demoDate(0))
    : `${formatCalendarTitle(demoDate(0))} - ${formatCalendarTitle(demoDate(4))}`;

const calendarCells = [
  ...Array.from({ length: calendarLeadingDays }, () => null),
  ...calendarCandidateDates,
];

function selectedDateIdsFromLabel(label: string) {
  return calendarCandidateDates
    .filter((date) => label.includes(date.label))
    .map((date) => date.id);
}

function selectedDateLabelsFromMeeting(dateRange: string) {
  return calendarCandidateDates.filter((date) => dateRange.includes(date.label));
}

function isPastCalendarDate(date: { value: Date }) {
  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  return date.value < todayStart;
}

const locationTypeLabels = {
  external: "외부 장소",
  internal: "사내 회의실",
  online: "온라인",
  undecided: "미정",
} as const;

function dateIdFromAvailability(dateLabel: string) {
  const match = dateLabel.match(/(\d+)월\s+(\d+)일/);

  if (!match) return "";

  return `date-${Number(match[1])}-${Number(match[2])}`;
}

function shortDateLabelFromAvailability(dateLabel: string) {
  const match = dateLabel.match(/(\d+)월\s+(\d+)일\s+(.+)요일/);

  if (!match) return { date: dateLabel, weekday: "" };

  return {
    date: `${Number(match[1])}/${Number(match[2])}`,
    weekday: match[3],
  };
}

function calendarCellBadge(
  item: AvailabilitySlot | undefined,
  meeting: Parameters<typeof getAvailabilityStatus>[1],
) {
  const status = getAvailabilityStatus(item, meeting);

  if (!item) return "";
  if (status.tone === "recommended") return "추천";
  if (status.tone === "required") return "필참";

  return `${item.availableIds.length}명`;
}

function availabilityForDate(dateId: string, slots: AvailabilitySlot[]) {
  return slots.find(
    (item) => dateIdFromAvailability(item.dateLabel) === dateId,
  );
}

function timeOptionFromAvailability(item: AvailabilitySlot) {
  return {
    id: item.id,
    label: `${item.dateLabel} ${item.timeLabel}`,
  };
}

export function MeetingCreateCard({ options }: MeetingCreateCardProps) {
  const navigate = useNavigate();
  const { meeting, updateMeeting, summaries } = useMeetingFlow();
  const [modal, setModal] = useState<ModalType>(null);
  const [draftDateIds, setDraftDateIds] = useState<string[]>([]);
  const [draftTimeIds, setDraftTimeIds] = useState<string[]>([]);
  const [draftCustomTimeOptions, setDraftCustomTimeOptions] = useState<
    SelectOption[]
  >([]);
  const [showCustomDeadline, setShowCustomDeadline] = useState(false);
  const [customDeadlineInput, setCustomDeadlineInput] = useState("");
  const deadlineOptions = createDeadlineOptions(meeting);
  const canSubmit =
    meeting.title.trim().length > 0 &&
    summaries.dateRange !== "후보 날짜 선택" &&
    meeting.timeIds.length > 0 &&
    summaries.deadline !== "응답 마감 선택";
  const reminderIds =
    meeting.reminderIds.length > 0
      ? meeting.reminderIds
      : meeting.reminderId
        ? [meeting.reminderId]
        : [];
  const customReminderSelected = reminderIds.includes("custom-reminder");
  const customReminderDate = meeting.customReminderDateTime
    ? new Date(meeting.customReminderDateTime)
    : null;
  const deadlineHoursById: Record<string, number> = {
    "deadline-6h": 6,
    "deadline-12h": 12,
    "deadline-24h": 24,
  };
  const deadlineDate = deadlineHoursById[meeting.deadlineId]
    ? (() => {
        const date = new Date();
        date.setHours(date.getHours() + deadlineHoursById[meeting.deadlineId]);
        return date;
      })()
    : null;
  const customReminderInvalid =
    customReminderSelected &&
    meeting.customReminderDateTime.length > 0 &&
    (!customReminderDate ||
      Number.isNaN(customReminderDate.getTime()) ||
      customReminderDate <= new Date() ||
      (deadlineDate ? customReminderDate >= deadlineDate : false));
  const requiredAttendeeIds = new Set(meeting.requiredAttendeeIds);
  const hasSelectedAttendees = meeting.attendeeIds.length > 0;
  const eligibleSlots = hasSelectedAttendees
    ? getEligibleAvailabilitySlots(meeting)
    : [];
  const chronologicalSlots = getChronologicalEligibleSlots(meeting);
  const allAttendeeIds = attendees.map((attendee) => attendee.id);
  const allAttendeesSelected = allAttendeeIds.every((attendeeId) =>
    meeting.attendeeIds.includes(attendeeId),
  );
  const partiallySelectedAttendees =
    !allAttendeesSelected &&
    allAttendeeIds.some((attendeeId) => meeting.attendeeIds.includes(attendeeId));
  const orderedTeamSchedules = teamRegisteredSchedules
    .filter((item) => meeting.attendeeIds.includes(item.attendeeId))
    .sort((a, b) => {
      const aRequired = requiredAttendeeIds.has(a.attendeeId);
      const bRequired = requiredAttendeeIds.has(b.attendeeId);

      if (aRequired === bRequired) return 0;

      return aRequired ? -1 : 1;
    });

  function toggleAttendee(attendeeId: string) {
    const selected = meeting.attendeeIds.includes(attendeeId);

    updateMeeting({
      attendeeIds: selected
        ? meeting.attendeeIds.filter((id) => id !== attendeeId)
        : [...meeting.attendeeIds, attendeeId],
      requiredAttendeeIds: selected
        ? meeting.requiredAttendeeIds.filter((id) => id !== attendeeId)
        : meeting.requiredAttendeeIds,
    });
  }

  function toggleRequired(attendeeId: string) {
    if (!meeting.attendeeIds.includes(attendeeId)) return;

    updateMeeting({
      requiredAttendeeIds: meeting.requiredAttendeeIds.includes(attendeeId)
        ? meeting.requiredAttendeeIds.filter((id) => id !== attendeeId)
        : [...meeting.requiredAttendeeIds, attendeeId],
    });
  }

  function toggleAllAttendees() {
    if (allAttendeesSelected) {
      updateMeeting({
        attendeeIds: [],
        requiredAttendeeIds: [],
      });
      return;
    }

    updateMeeting({
      attendeeIds: allAttendeeIds,
      requiredAttendeeIds: meeting.requiredAttendeeIds.filter((attendeeId) =>
        allAttendeeIds.includes(attendeeId),
      ),
    });
  }

  function openDateModal() {
    setDraftDateIds(
      selectedDateIdsFromLabel(summaries.dateRange).filter((dateId) => {
        const date = calendarCandidateDates.find((item) => item.id === dateId);

        return date ? !isPastCalendarDate(date) : false;
      }),
    );
    setModal("dateRange");
  }

  function openTeamScheduleModal() {
    if (meeting.attendeeIds.length === 0) {
      setModal("attendeeRequired");
      return;
    }

    setModal("teamSchedule");
  }

  function openTimesModal() {
    setDraftTimeIds(meeting.timeIds);
    setDraftCustomTimeOptions(meeting.customTimeOptions);
    setModal("times");
  }

  function toggleDate(dateId: string) {
    const selectedDate = calendarCandidateDates.find((date) => date.id === dateId);

    if (selectedDate && isPastCalendarDate(selectedDate)) return;

    setDraftDateIds((current) =>
      current.includes(dateId)
        ? current.filter((id) => id !== dateId)
        : [...current, dateId],
    );
  }

  function toggleReminder(reminderId: string) {
    const selected = reminderIds.includes(reminderId);
    const nextReminderIds = selected
      ? reminderIds.filter((id) => id !== reminderId)
      : [...reminderIds, reminderId];

    updateMeeting({
      customReminderDateTime:
        reminderId === "custom-reminder" && selected
          ? ""
          : meeting.customReminderDateTime,
      reminderId: nextReminderIds[0] ?? "",
      reminderIds: nextReminderIds,
    });
  }

  function renderAvailabilityResultCards() {
    return (
      <div className="space-y-2">
        {eligibleSlots.map((item, index) => {
          const status = getAvailabilityStatus(item, meeting);
          const isRecommended = index === 0;
          const dateLabel = item.dateLabel.replace("요일", "");
          const description =
            item.availableIds.length === meeting.attendeeIds.length
              ? index === 0
                ? "가장 빠른 전원 가능 일정"
                : `${index + 1}번째 전원 가능 일정`
              : "필수 전원 가능 일정";

          return (
            <div
              className={cn(
                "rounded-lg border px-4 py-3",
                isRecommended
                  ? "border-[#837CFF] bg-[#F7F6FF]"
                  : "border-[#E0E4EB] bg-[#F9FAFB]",
              )}
              key={item.id}
            >
              <div className="flex items-center gap-2 text-sm font-bold leading-[21px] text-[#101828]">
                {isRecommended ? (
                  <span className="rounded-full bg-[#837CFF] px-2 py-[2px] text-[11px] font-bold leading-[16px] text-white">
                    추천
                  </span>
                ) : null}
                <span>
                  {dateLabel} {item.timeLabel} · {item.availableIds.length}명 가능
                </span>
              </div>
              <p className="mt-1 text-xs font-medium leading-[18px] text-[#667085]">
                {status.label === "추천" ? "필수 전원 가능" : status.label} · {description}
              </p>
            </div>
          );
        })}
        {eligibleSlots.length === 0 ? (
          <div className="text-sm font-medium leading-[21px] text-[#98A2B3]">
            필수 참석자 전원이 가능한 후보 일정이 없습니다.
          </div>
        ) : null}
      </div>
    );
  }

  function renderModal() {
    if (modal === "attendeeRequired") {
      return (
        <ChoiceModal onClose={() => setModal(null)} title="참석자를 먼저 선택해주세요">
          <div>
            <p className="text-sm font-medium leading-[21px] text-[#667085]">
              팀원 일정을 확인하려면 회의 참석자를 먼저 선택해야 해요.
            </p>
            <Button
              className="mt-5 h-11 w-full rounded-lg bg-[#635BFF] text-sm font-bold leading-[21px] text-white hover:bg-[#635BFF]/90 active:bg-[#554DE8]"
              onClick={() => setModal("attendees")}
            >
              참석자 선택
            </Button>
          </div>
        </ChoiceModal>
      );
    }

    if (modal === "availabilityDetail") {
      return (
        <ChoiceModal onClose={() => setModal("teamSchedule")} title="일정 집계 결과">
          <div className="flex h-full min-h-0 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto pr-2">
              {renderAvailabilityResultCards()}
            </div>
            <Button
              className="mt-4 h-11 w-full shrink-0 rounded-lg bg-[#635BFF] text-sm font-bold leading-[21px] text-white hover:bg-[#635BFF]/90 active:bg-[#554DE8]"
              onClick={() => setModal("teamSchedule")}
            >
              확인
            </Button>
          </div>
        </ChoiceModal>
      );
    }

    if (modal === "teamSchedule") {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#101828]/20 p-6">
          <section className="flex max-h-[85vh] w-[480px] flex-col overflow-hidden rounded-xl border border-[#E0E4EB] bg-white shadow-[0_20px_60px_rgba(16,24,40,0.16)]">
            <header className="shrink-0 px-6 pb-4 pt-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold leading-7 text-[#101828]">
                  팀원 일정 ({meeting.attendeeIds.length}명)
                </h2>
                <button
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#667085] hover:bg-[#F3F4F6]"
                  onClick={() => setModal(null)}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-4 text-sm font-medium leading-[21px] text-[#667085]">
                회의 전 팀원들의 등록된 일정을 확인하세요.
              </p>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 pr-4">
              <div className="space-y-2.5 pr-2">
                {orderedTeamSchedules.map((item) => {
                  const required = requiredAttendeeIds.has(item.attendeeId);

                  return (
                    <div
                      className="rounded-lg border border-[#E0E4EB] bg-[#F9FAFB] px-4 py-2.5"
                      key={item.name}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-2">
                          <div className="text-sm font-bold leading-[21px] text-[#101828]">
                            {item.name}
                          </div>
                          <span
                            className={cn(
                              "rounded-full px-2 py-[3px] text-[11px] font-bold leading-[17px]",
                              required
                                ? "bg-[#F0EEFF] text-[#635BFF]"
                                : "bg-[#F3F4F6] text-[#667085]",
                            )}
                          >
                            {required ? "필수" : "선택"}
                          </span>
                        </div>
                        {item.schedules.length === 0 ? (
                          <span className="rounded-full bg-[#F3F4F6] px-2 py-[3px] text-xs font-bold leading-[18px] text-[#98A2B3]">
                            미등록
                          </span>
                        ) : null}
                      </div>
                      {item.schedules.length > 0 ? (
                        <div className="mt-1.5 space-y-0.5">
                          {item.schedules.map((schedule) => (
                            <div
                              className="text-[13px] font-medium leading-5 text-[#475467]"
                              key={schedule}
                            >
                              {schedule}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-1.5 text-[13px] font-medium leading-5 text-[#98A2B3]">
                          등록된 일정이 없습니다.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <section className="shrink-0 border-t border-[#E0E4EB] bg-white px-6 py-4">
              <div className="rounded-lg border border-[#E0E4EB] bg-white px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-bold leading-[21px] text-[#101828]">
                    일정 집계 결과
                  </h3>
                  <button
                    className="text-xs font-bold leading-[18px] text-[#635BFF]"
                    onClick={() => setModal("availabilityDetail")}
                    type="button"
                  >
                    전체 결과 보기
                  </button>
                </div>
                <div className="mt-2 space-y-1">
                  {eligibleSlots.slice(0, 3).map((item, index) => {
                    const label = `${item.shortDateLabel
                      .replace(" (", " ")
                      .replace(")", "")} ${item.timeLabel} · ${item.availableIds.length}명 가능`;

                    return index === 0 ? (
                      <div
                        className="flex items-center gap-2 rounded-lg border border-[#837CFF] bg-[#F7F6FF] px-3 py-2"
                        key={item.id}
                      >
                        <span className="shrink-0 rounded-full bg-[#837CFF] px-2 py-[2px] text-[11px] font-bold leading-[16px] text-white">
                          추천
                        </span>
                        <span className="min-w-0 truncate text-xs font-bold leading-[18px] text-[#635BFF]">
                          {label}
                        </span>
                      </div>
                    ) : (
                      <p
                        className="truncate text-xs font-medium leading-[18px] text-[#475467]"
                        key={item.id}
                      >
                        {label}
                      </p>
                    );
                  })}
                  {eligibleSlots.length === 0 ? (
                    <p className="text-xs font-medium leading-[18px] text-[#98A2B3]">
                      필수 참석자 전원이 가능한 후보 일정이 없습니다.
                    </p>
                  ) : null}
                </div>
              </div>
            </section>

            <footer className="shrink-0 border-t border-[#E0E4EB] bg-white px-6 pb-6 pt-4">
              <Button
                className="h-11 w-full rounded-lg bg-[#635BFF] text-sm font-bold leading-[21px] text-white hover:bg-[#635BFF]/90 active:bg-[#554DE8]"
                onClick={openDateModal}
              >
                후보 날짜 선택하기
              </Button>
            </footer>
          </section>
        </div>
      );
    }

    if (modal === "attendees") {
      return (
        <ChoiceModal onClose={() => setModal(null)} title="참석자 선택">
          <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
            <button
              className={cn(
                "flex h-11 w-full items-center justify-between rounded-lg border px-4 text-left",
                allAttendeesSelected || partiallySelectedAttendees
                  ? "border-[#837CFF] bg-[#F7F6FF]"
                  : "border-[#E0E4EB] bg-white",
              )}
              onClick={toggleAllAttendees}
              type="button"
            >
              <span className="text-sm font-bold leading-[21px] text-[#101828]">
                모두 선택
              </span>
              <span
                className={cn(
                  "flex h-[18px] w-[18px] items-center justify-center rounded border",
                  allAttendeesSelected || partiallySelectedAttendees
                    ? "border-[#837CFF] bg-[#837CFF] text-white"
                    : "border-[#D0D5DD] bg-white text-transparent",
                )}
              >
                {partiallySelectedAttendees ? (
                  <span className="h-[2px] w-2.5 rounded bg-white" />
                ) : (
                  <Check className="h-[11px] w-[11px]" strokeWidth={3} />
                )}
              </span>
            </button>
            {attendees.map((attendee) => {
              const selected = meeting.attendeeIds.includes(attendee.id);
              const required = meeting.requiredAttendeeIds.includes(attendee.id);

              return (
                <div
                  className={cn(
                    "flex h-[58px] cursor-pointer items-center justify-between rounded-lg border px-4",
                    selected
                      ? "border-[#837CFF] bg-[#F7F6FF]"
                      : "border-[#E0E4EB] bg-white",
                  )}
                  key={attendee.id}
                  onClick={() => toggleAttendee(attendee.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      toggleAttendee(attendee.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex min-w-0 flex-1 items-center text-left">
                    <AvatarBadge color={attendee.color} initial={attendee.initial} />
                    <span className="ml-3 min-w-0">
                      <span className="flex items-center gap-2 text-sm font-bold leading-[21px] text-[#101828]">
                        {attendee.name}
                        <span
                          className={cn(
                            "rounded-full px-2 py-[2px] text-[11px] font-bold leading-[16px]",
                            required
                              ? "bg-[#F0EEFF] text-[#635BFF]"
                              : "bg-[#F3F4F6] text-[#667085]",
                          )}
                        >
                          {required ? "필수 참석자" : "선택 참석자"}
                        </span>
                      </span>
                      <span className="block text-xs font-medium leading-[18px] text-[#808CA1]">
                        {attendee.role}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-bold leading-[18px]",
                        selected
                          ? "bg-[#F7F6FF] text-[#837CFF]"
                          : "bg-[#F3F4F6] text-[#98A2B3]",
                      )}
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleAttendee(attendee.id);
                      }}
                      type="button"
                    >
                      {selected ? "선택됨" : "선택"}
                    </button>
                    <button
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-bold leading-[18px]",
                        required
                          ? "bg-[#837CFF] text-white"
                          : "bg-white text-[#667085]",
                        !selected && "opacity-40",
                      )}
                      disabled={!selected}
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleRequired(attendee.id);
                      }}
                      type="button"
                    >
                      필수
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="sticky bottom-0 mt-5 border-t border-[#E0E4EB] bg-white pt-4">
            <div className="mb-2 text-center text-xs font-bold leading-[18px] text-[#667085]">
              {meeting.attendeeIds.length}명 선택
            </div>
            <Button
              className="h-12 w-full rounded-lg bg-[#635BFF] text-sm font-bold leading-[21px] text-white hover:bg-[#635BFF]/90 disabled:bg-[#C9CED8] disabled:text-white"
              disabled={meeting.attendeeIds.length === 0}
              onClick={() => setModal(null)}
            >
              {meeting.attendeeIds.length}명 선택 완료
            </Button>
          </div>
        </ChoiceModal>
      );
    }

    if (modal === "dateRange") {
      return (
        <ChoiceModal onClose={() => setModal(null)} title="후보 날짜 선택">
          <p className="mb-3 text-xs font-medium leading-[18px] text-[#94A3B8]">
            팀원 일정 집계 결과를 참고해 후보 날짜를 복수로 선택하세요.
          </p>
          <div className="rounded-xl border border-[#E0E4EB] bg-[#F9FAFB] p-4">
            <div className="mb-4 text-center text-sm font-bold leading-[21px] text-[#101828]">
              {calendarTitle}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {calendarWeekdays.map((weekday) => (
                <div
                  className="h-7 text-xs font-bold leading-7 text-[#98A2B3]"
                  key={weekday}
                >
                  {weekday}
                </div>
              ))}
              {calendarCells.map((date, index) => {
                if (!date) {
                  return <div aria-hidden className="h-11" key={`blank-${index}`} />;
                }

                const selected = draftDateIds.includes(date.id);
                const availability = availabilityForDate(date.id, chronologicalSlots);
                const status = getAvailabilityStatus(availability, meeting);
                const badge = calendarCellBadge(availability, meeting);
                const past = isPastCalendarDate(date);
                const disabled = past || !availability;

                return (
                  <button
                    aria-pressed={selected}
                    className={cn(
                      "relative flex h-11 flex-col items-center justify-center rounded-lg border text-sm font-bold leading-[18px] transition-colors",
                      past &&
                        "cursor-not-allowed border-transparent bg-[#F3F4F6] text-[#C9CED8]",
                      !past &&
                        !availability &&
                        "cursor-not-allowed border-transparent bg-white text-[#C9CED8]",
                      status.tone === "recommended" &&
                        "border-[#837CFF] bg-[#837CFF] text-white",
                      status.tone === "all" &&
                        "border-[#837CFF] bg-[#F7F6FF] text-[#635BFF]",
                      status.tone === "required" &&
                        "border-[#837CFF] bg-white text-[#475467]",
                      !disabled &&
                        !selected &&
                        status.tone !== "recommended" &&
                        "hover:bg-[#F7F6FF] hover:text-[#837CFF]",
                      selected && "ring-2 ring-[#C9C5FF]",
                    )}
                    disabled={disabled}
                    key={date.id}
                    onClick={() => toggleDate(date.id)}
                    type="button"
                  >
                    <span>{date.day}</span>
                    {badge ? (
                      <span
                        className={cn(
                          "mt-0.5 text-[10px] font-bold leading-[12px]",
                          status.tone === "recommended"
                            ? "text-white"
                            : "text-[#635BFF]",
                        )}
                      >
                        {badge}
                      </span>
                    ) : null}
                    {selected ? (
                      <span
                        className={cn(
                          "absolute right-1 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full",
                          status.tone === "recommended"
                            ? "bg-white text-[#635BFF]"
                            : "bg-[#837CFF] text-white",
                        )}
                      >
                        <Check className="h-2.5 w-2.5" strokeWidth={3} />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-[#837CFF] px-2.5 py-1 text-[11px] font-bold leading-[16px] text-white">
              추천
            </span>
            <span className="rounded-full border border-[#837CFF] bg-[#F7F6FF] px-2.5 py-1 text-[11px] font-bold leading-[16px] text-[#635BFF]">
              전원 가능
            </span>
            <span className="rounded-full border border-[#837CFF] bg-white px-2.5 py-1 text-[11px] font-bold leading-[16px] text-[#635BFF]">
              필참 가능
            </span>
          </div>
          <div className="mt-4 grid grid-cols-[1fr_2fr] gap-2">
            <Button
              className="h-12 rounded-lg border border-[#E0E4EB] bg-white text-sm font-bold leading-[21px] text-[#667085] hover:bg-[#F9FAFB]"
              disabled={draftDateIds.length === 0}
              onClick={() => {
                setDraftDateIds([]);
                updateMeeting({
                  customDateRange: "",
                  dateRangeId: "",
                  timeIds: [],
                  customTimeOptions: [],
                  deadlineId: "",
                  customDeadline: "",
                  roomSelectionDeferred: false,
                  selectedRoomId: "",
                });
              }}
              type="button"
            >
              선택 취소
            </Button>
            <Button
              className="h-12 rounded-lg bg-[#635BFF] text-sm font-bold leading-[21px] text-white hover:bg-[#635BFF]/90 disabled:bg-[#C9CED8] disabled:text-white"
              disabled={draftDateIds.length === 0}
              onClick={() => {
                const selectedDates = calendarCandidateDates.filter((date) =>
                  draftDateIds.includes(date.id),
                );
                const label = selectedDates.map((date) => date.label).join(", ");

                updateMeeting({
                  customDateRange: label,
                  dateRangeId: "custom-date-range",
                  timeIds: [],
                  customTimeOptions: [],
                  deadlineId: "",
                  customDeadline: "",
                  roomSelectionDeferred: false,
                  selectedRoomId: "",
                });
                setModal(null);
              }}
            >
              선택 완료
            </Button>
          </div>
        </ChoiceModal>
      );
    }

    if (modal === "times") {
      const selectedDates = selectedDateLabelsFromMeeting(summaries.dateRange);
      const candidateChecklistItems = chronologicalSlots.filter((item) =>
        selectedDates.some(
          (date) => date.id === dateIdFromAvailability(item.dateLabel),
        ),
      );
      const allCandidateIds = candidateChecklistItems.map((item) => item.id);
      const allSelected =
        allCandidateIds.length > 0 &&
        allCandidateIds.every((id) => draftTimeIds.includes(id));

      return (
        <ChoiceModal onClose={() => setModal(null)} title="후보 시간 선택">
          {selectedDates.length > 0 ? (
            <>
              <p className="mb-3 text-xs font-medium leading-[18px] text-[#94A3B8]">
                팀원 일정 집계 결과를 확인하고 후보 날짜와 시간을 선택하세요.
              </p>
              <div className="rounded-lg border border-[#E0E4EB] bg-[#F9FAFB] p-3">
                <button
                  className="mb-3 flex w-full items-center justify-between rounded-lg border border-[#E0E4EB] bg-white px-4 py-3 text-left"
                  onClick={() => {
                    if (allSelected) {
                      setDraftTimeIds((current) =>
                        current.filter((id) => !allCandidateIds.includes(id)),
                      );
                      setDraftCustomTimeOptions((current) =>
                        current.filter((item) => !allCandidateIds.includes(item.id)),
                      );
                      return;
                    }

                    setDraftTimeIds((current) => [
                      ...current.filter((id) => !allCandidateIds.includes(id)),
                      ...allCandidateIds,
                    ]);
                    setDraftCustomTimeOptions((current) => [
                      ...current.filter((item) => !allCandidateIds.includes(item.id)),
                      ...candidateChecklistItems.map(timeOptionFromAvailability),
                    ]);
                  }}
                  type="button"
                >
                  <span className="flex items-center gap-3 text-sm font-bold leading-[21px] text-[#101828]">
                    <span
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded border",
                        allSelected
                          ? "border-[#837CFF] bg-[#837CFF] text-white"
                          : "border-[#C9CED8] bg-white",
                      )}
                    >
                      {allSelected ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
                    </span>
                    전체 선택
                  </span>
                  <span className="text-xs font-medium leading-[18px] text-[#667085]">
                    {candidateChecklistItems.length}개 후보
                  </span>
                </button>
                <div className="max-h-[340px] space-y-2 overflow-y-auto pr-1">
                  {candidateChecklistItems.map((item) => {
                    const selected = draftTimeIds.includes(item.id);
                    const status = getAvailabilityStatus(item, meeting);
                    const dateParts = shortDateLabelFromAvailability(item.dateLabel);

                    return (
                      <button
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg border bg-white px-4 py-3 text-left transition",
                          selected
                            ? "border-[#837CFF] bg-[#F0EEFF]"
                            : "border-[#E0E4EB] hover:border-[#C9C5FF] hover:bg-[#F7F6FF]",
                        )}
                        key={item.id}
                        onClick={() => {
                          const option = timeOptionFromAvailability(item);

                          if (selected) {
                            setDraftTimeIds((current) =>
                              current.filter((id) => id !== option.id),
                            );
                            setDraftCustomTimeOptions((current) =>
                              current.filter((candidate) => candidate.id !== option.id),
                            );
                            return;
                          }

                          setDraftTimeIds((current) => [...current, option.id]);
                          setDraftCustomTimeOptions((current) =>
                            current.some((candidate) => candidate.id === option.id)
                              ? current
                              : [...current, option],
                          );
                        }}
                        type="button"
                      >
                        <span
                          className={cn(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                            selected
                              ? "border-[#837CFF] bg-[#837CFF] text-white"
                              : "border-[#C9CED8] bg-white",
                          )}
                        >
                          {selected ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-bold leading-[21px] text-[#101828]">
                            {dateParts.date} {dateParts.weekday}
                          </span>
                          <span className="block text-sm font-medium leading-[21px] text-[#475467]">
                            {item.timeLabel}
                          </span>
                        </span>
                        <span className="shrink-0 text-right">
                          <span className="block text-xs font-bold leading-[18px] text-[#667085]">
                            {item.availableIds.length}명 가능
                          </span>
                          <span
                            className={cn(
                              "mt-1 inline-flex rounded-full px-2 py-[2px] text-[11px] font-bold leading-[16px]",
                              status.tone === "recommended" &&
                                "bg-[#837CFF] text-white",
                              status.tone === "all" &&
                                "bg-[#F0EEFF] text-[#635BFF]",
                              status.tone === "required" &&
                                "border border-[#837CFF] bg-white text-[#635BFF]",
                            )}
                          >
                            {status.label}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <Button
                className="mt-4 h-12 w-full rounded-lg bg-[#635BFF] text-sm font-bold leading-[21px] text-white hover:bg-[#635BFF]/90 disabled:bg-[#C9CED8] disabled:text-white"
                disabled={draftTimeIds.length === 0}
                onClick={() => {
                  updateMeeting({
                    timeIds: draftTimeIds,
                    customTimeOptions: draftCustomTimeOptions,
                    roomSelectionDeferred: false,
                    selectedRoomId: "",
                  });
                  setModal(null);
                }}
              >
                후보 {draftTimeIds.length}개 선택 완료
              </Button>
            </>
          ) : (
            <p className="text-sm font-medium leading-[21px] text-[#667085]">
              후보 날짜를 먼저 선택해주세요.
            </p>
          )}
        </ChoiceModal>
      );
    }

    if (modal === "deadline") {
      return (
        <ChoiceModal onClose={() => setModal(null)} title="응답 마감 선택">
          <OptionList
            onSelect={(id) => {
              updateMeeting({ deadlineId: id, customDeadline: "" });
              setModal(null);
            }}
            options={deadlineOptions}
            selectedIds={[meeting.deadlineId]}
          />
          <CustomInput
            buttonLabel="직접 선택"
            inputMode="text"
            onCancel={() => {
              setShowCustomDeadline(false);
              setCustomDeadlineInput("");
            }}
            onSubmit={() => {
              const value = customDeadlineInput.trim();
              if (!value) return;
              updateMeeting({
                customDeadline: value,
                deadlineId: "custom-deadline",
              });
              setCustomDeadlineInput("");
              setShowCustomDeadline(false);
              setModal(null);
            }}
            onToggle={() => setShowCustomDeadline(true)}
            placeholder="예: 24시간 후 또는 직접 날짜/시간"
            setValue={setCustomDeadlineInput}
            show={showCustomDeadline}
            suffix=""
            value={customDeadlineInput}
          />
        </ChoiceModal>
      );
    }

    if (modal === "location") {
      return (
        <ChoiceModal onClose={() => setModal(null)} title="장소 유형 선택">
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "internal", label: "사내 회의실" },
              { id: "online", label: "온라인" },
              { id: "external", label: "외부 장소" },
              { id: "undecided", label: "미정" },
            ].map((option) => {
              const selected = meeting.locationType === option.id;

              return (
                <button
                  className={cn(
                    "h-12 rounded-lg border text-sm font-bold leading-[21px]",
                    selected
                      ? "border-[#837CFF] bg-[#F7F6FF] text-[#837CFF]"
                      : "border-[#E0E4EB] bg-[#F9FAFB] text-[#475467]",
                  )}
                  key={option.id}
                  onClick={() =>
                    updateMeeting({
                      externalLocationName:
                        option.id === "external"
                          ? meeting.externalLocationName
                          : "",
                      locationType: option.id as typeof meeting.locationType,
                      roomSelectionDeferred: false,
                      selectedRoomId: "",
                      videoLink: option.id === "online" ? meeting.videoLink : "",
                      videoLinkMode:
                        option.id === "online" ? meeting.videoLinkMode : "later",
                    })
                  }
                  type="button"
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          {meeting.locationType === "internal" ? (
            <p className="mt-4 rounded-lg border border-[#E0E4EB] bg-[#F9FAFB] px-4 py-3 text-sm font-medium leading-[21px] text-[#667085]">
              회의 시간이 확정되면 사용 가능한 회의실을 선택할 수 있어요.
            </p>
          ) : null}

          {meeting.locationType === "online" ? (
            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="text-sm font-bold leading-[21px] text-[#344054]">
                  화상회의 링크
                </span>
                <input
                  className="mt-2 h-11 w-full rounded-lg border border-[#D0D5DD] px-3 text-sm font-medium leading-[21px] text-[#101828] outline-none placeholder:text-[#98A2B3] focus:border-[#635BFF]"
                  onChange={(event) =>
                    updateMeeting({
                      videoLink: event.target.value,
                      videoLinkMode: "manual",
                    })
                  }
                  placeholder="https://"
                  value={meeting.videoLink}
                />
              </label>
              <button
                className={cn(
                  "h-11 w-full rounded-lg border text-sm font-bold leading-[21px]",
                  meeting.videoLinkMode === "later"
                    ? "border-[#837CFF] bg-[#F7F6FF] text-[#837CFF]"
                    : "border-[#E0E4EB] bg-white text-[#667085]",
                )}
                onClick={() =>
                  updateMeeting({ videoLink: "", videoLinkMode: "later" })
                }
                type="button"
              >
                화상회의 링크 추후 생성
              </button>
            </div>
          ) : null}

          {meeting.locationType === "external" ? (
            <label className="mt-4 block">
              <span className="text-sm font-bold leading-[21px] text-[#344054]">
                장소명
              </span>
              <input
                className="mt-2 h-11 w-full rounded-lg border border-[#D0D5DD] px-3 text-sm font-medium leading-[21px] text-[#101828] outline-none placeholder:text-[#98A2B3] focus:border-[#635BFF]"
                onChange={(event) =>
                  updateMeeting({ externalLocationName: event.target.value })
                }
                placeholder="외부 장소명을 입력해주세요"
                value={meeting.externalLocationName}
              />
            </label>
          ) : null}

          <Button
            className="mt-5 h-11 w-full rounded-lg bg-[#635BFF] text-sm font-bold leading-[21px] text-white hover:bg-[#635BFF]/90 active:bg-[#554DE8]"
            onClick={() => setModal(null)}
          >
            선택 완료
          </Button>
        </ChoiceModal>
      );
    }

    return null;
  }

  return (
    <>
      <section className="h-[744px] w-[880px] rounded-xl border border-[#E0E4EB] bg-white px-7 pb-8 pt-6">
        <div className="flex h-14 w-[824px] items-start justify-between">
          <div>
            <p className="text-[13px] font-medium leading-5 text-[#475467]">
              채팅에서 회의 카드를 만듭니다
            </p>
          </div>
          <Button
            className="h-12 w-40 rounded-lg bg-[#635BFF] text-sm font-bold leading-[21px] text-white hover:bg-[#635BFF]/90 disabled:bg-[#C9CED8] disabled:text-white"
            disabled={!canSubmit}
            onClick={() => navigate("/meetings/requested")}
          >
            응답 요청 보내기
          </Button>
        </div>

        <div className="mt-10 grid w-[824px] grid-cols-2 gap-x-8 gap-y-5">
          <TitleField
            onChange={(title) => updateMeeting({ title })}
            value={meeting.title}
          />
          <Field
            label="2. 참석자"
            onClick={() => setModal("attendees")}
            value={summaries.requiredLabel}
          />
          <Field
            badge
            label="3. 팀원 일정"
            onClick={openTeamScheduleModal}
            value={`일정 확인 (${meeting.attendeeIds.length}명)`}
          />
          <Field
            label="4. 후보 날짜"
            onClick={openDateModal}
            placeholder={summaries.dateRange === "후보 날짜 선택"}
            value={summaries.dateRange}
          />
          <Field
            helper="2~5개 선택"
            label="5. 후보 시간"
            onClick={openTimesModal}
            placeholder={meeting.timeIds.length === 0}
            value={summaries.timeCount}
          />
          <Field
            label="6. 응답 마감"
            onClick={() => setModal("deadline")}
            placeholder={summaries.deadline === "응답 마감 선택"}
            value={summaries.deadline}
          />
          <Field
            label="7. 장소 유형"
            onClick={() => setModal("location")}
            value={
              meeting.locationType === "online" && meeting.videoLinkMode === "manual"
                ? "온라인 · 링크 입력"
                : meeting.locationType === "external" &&
                    meeting.externalLocationName.trim()
                  ? `외부 장소 · ${meeting.externalLocationName}`
                  : locationTypeLabels[meeting.locationType]
            }
          />
        </div>

        <div className="mt-10 w-[824px]">
          <h3 className="text-base font-bold leading-6 text-[#101828]">
            응답 리마인드
          </h3>
          <div className="mt-4 grid grid-cols-[360px_360px] items-start gap-x-14">
            <div className="flex flex-col gap-5">
              <div className="flex h-8 items-center justify-between">
                <span className="text-sm font-medium leading-[21px] text-[#101828]">
                  자동 리마인드 사용
                </span>
                <button
                  className={cn(
                    "relative h-6 w-11 rounded-full transition-colors",
                    meeting.reminderEnabled ? "bg-[#837CFF]" : "bg-[#D0D5DD]",
                  )}
                  onClick={() =>
                    updateMeeting({ reminderEnabled: !meeting.reminderEnabled })
                  }
                  type="button"
                >
                  <span
                    className={cn(
                      "absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow transition-all",
                      meeting.reminderEnabled ? "left-[23px]" : "left-[3px]",
                    )}
                  />
                </button>
              </div>
              <button
                className="flex items-center gap-2.5 rounded text-sm font-medium leading-[21px] text-[#101828]"
                onClick={() => updateMeeting({ unansweredOnly: true })}
                type="button"
              >
                <span
                  className={cn(
                    "flex h-[18px] w-[18px] items-center justify-center rounded border",
                    "border-[#837CFF] bg-[#837CFF] text-white",
                  )}
                >
                  <Check className="h-[11px] w-[11px]" strokeWidth={3} />
                </span>
                응답하지 않은 참석자에게만 리마인드를 보냅니다.
              </button>
              <div className="flex min-h-[70px] w-[360px] items-center rounded-lg border border-[#E0E4EB] bg-[#F9FAFB] px-[17px] py-3">
                <p className="w-full text-[13px] font-medium leading-5 text-[#475467]">
                  {summaries.reminderText}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {options.reminders.map((option) => (
                <ReminderOption
                  disabled={!meeting.reminderEnabled}
                  key={option.id}
                  label={option.label}
                  onClick={() => toggleReminder(option.id)}
                  selected={reminderIds.includes(option.id)}
                />
              ))}
              <CustomReminderOption
                disabled={!meeting.reminderEnabled}
                invalid={customReminderInvalid}
                onSelect={() => toggleReminder("custom-reminder")}
                onValueChange={(value) =>
                  updateMeeting({
                    customReminderDateTime: value,
                    reminderId: reminderIds.includes("custom-reminder")
                      ? meeting.reminderId
                      : "custom-reminder",
                    reminderIds: reminderIds.includes("custom-reminder")
                      ? reminderIds
                      : [...reminderIds, "custom-reminder"],
                  })
                }
                selected={customReminderSelected}
                value={meeting.customReminderDateTime}
              />
            </div>
          </div>
        </div>
      </section>
      {renderModal()}
    </>
  );
}

function CustomReminderOption({
  selected,
  disabled,
  invalid,
  value,
  onSelect,
  onValueChange,
}: {
  selected: boolean;
  disabled: boolean;
  invalid: boolean;
  value: string;
  onSelect: () => void;
  onValueChange: (value: string) => void;
}) {
  return (
    <div
      className={cn(
        "w-[360px] rounded-lg border px-[17px] text-left text-sm font-medium leading-[21px]",
        selected
          ? "border-[#837CFF] bg-[#F7F6FF] text-[#837CFF]"
          : "border-[#E0E4EB] bg-[#F9FAFB] text-[#475467]",
        disabled && "opacity-45",
      )}
    >
      <button
        className="flex h-12 w-full items-center gap-3 text-left"
        disabled={disabled}
        onClick={onSelect}
        type="button"
      >
        <span
          className={cn(
            "flex h-[18px] w-[18px] items-center justify-center rounded border",
            selected
              ? "border-[#837CFF] bg-[#837CFF] text-white"
              : "border-[#D0D5DD] bg-white text-transparent",
          )}
        >
          <Check className="h-[11px] w-[11px]" strokeWidth={3} />
        </span>
        <span>직접 입력</span>
      </button>
      {selected ? (
        <div className="pb-3 pl-[30px]">
          <input
            className="h-9 w-full rounded-lg border border-[#E0E4EB] bg-white px-3 text-sm font-medium leading-[21px] text-[#101828] outline-none focus:border-[#635BFF]"
            onChange={(event) => onValueChange(event.target.value)}
            type="datetime-local"
            value={value}
          />
          {invalid ? (
            <p className="mt-2 text-xs font-medium leading-[18px] text-[#F04438]">
              리마인드는 현재 이후, 응답 마감 이전 시간만 선택할 수 있습니다.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function CustomInput({
  buttonLabel,
  show,
  value,
  placeholder,
  suffix,
  inputMode,
  setValue,
  onToggle,
  onSubmit,
  onCancel,
}: {
  buttonLabel: string;
  show: boolean;
  value: string;
  placeholder: string;
  suffix: string;
  inputMode: "text" | "numeric";
  setValue: (value: string) => void;
  onToggle: () => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  if (!show) {
    return buttonLabel ? (
      <button
        className="mt-3 flex h-11 w-full items-center justify-center rounded-lg border border-dashed border-[#C9CED8] bg-white text-sm font-bold leading-[21px] text-[#635BFF]"
        onClick={onToggle}
        type="button"
      >
        {buttonLabel}
      </button>
    ) : null;
  }

  return (
    <div className="mt-3 rounded-lg border border-[#E0E4EB] bg-[#F9FAFB] p-3">
      <div className="flex items-center gap-2">
        {inputMode === "numeric" ? (
          <span className="text-sm font-medium leading-[21px] text-[#475467]">
            마감
          </span>
        ) : null}
        <input
          className="h-10 min-w-0 flex-1 rounded-lg border border-[#E0E4EB] bg-white px-3 text-sm font-medium leading-[21px] text-[#101828] outline-none focus:border-[#635BFF]"
          inputMode={inputMode}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          type={inputMode === "numeric" ? "number" : "text"}
          value={value}
        />
        {suffix ? (
          <span className="text-sm font-medium leading-[21px] text-[#475467]">
            {suffix}
          </span>
        ) : null}
      </div>
      <div className="mt-2 flex justify-end gap-2">
        <button
          className="h-8 rounded-md px-3 text-xs font-bold leading-[18px] text-[#667085]"
          onClick={onCancel}
          type="button"
        >
          취소
        </button>
        <button
          className="h-8 rounded-md bg-[#635BFF] px-3 text-xs font-bold leading-[18px] text-white"
          onClick={onSubmit}
          type="button"
        >
          적용
        </button>
      </div>
    </div>
  );
}

function OptionList({
  options,
  selectedIds,
  multiple = false,
  onSelect,
}: {
  options: SelectOption[];
  selectedIds: string[];
  multiple?: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      {options.map((option) => {
        const selected = selectedIds.includes(option.id);

        return (
          <button
            className={cn(
              "flex h-12 w-full items-center justify-between rounded-lg border px-4 text-left text-sm font-medium leading-[21px]",
              selected
                ? "border-[#837CFF] bg-[#F7F6FF] text-[#837CFF]"
                : "border-[#E0E4EB] bg-[#F9FAFB] text-[#475467]",
            )}
            key={option.id}
            onClick={() => onSelect(option.id)}
            type="button"
          >
            {option.label}
            <span
              className={cn(
                "flex h-[18px] w-[18px] items-center justify-center rounded-full border-2",
                selected ? "border-[#837CFF]" : "border-[#D0D5DD]",
                multiple && "rounded",
              )}
            >
              {selected ? <span className="h-2 w-2 rounded-full bg-[#837CFF]" /> : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
