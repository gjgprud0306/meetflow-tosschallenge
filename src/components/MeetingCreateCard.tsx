import { Check, ChevronRight, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AvatarBadge } from "@/components/AvatarBadge";
import { Button } from "@/components/ui/button";
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
  | "teamSchedule"
  | "dateRange"
  | "times"
  | "deadline"
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
        {label !== "1. 회의 제목" && label !== "2. 팀원 일정" ? (
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
          1. 회의 제목
        </div>
      </div>
      <input
        className="flex h-12 w-[360px] items-center rounded-lg border border-[#E0E4EB] bg-[#F9FAFB] px-[17px] text-sm font-medium leading-[21px] text-[#101828] outline-none placeholder:text-[#98A2B3] focus:border-[#635BFF]"
        onChange={(event) => onChange(event.target.value)}
        placeholder="회의 제목을 입력해주세요"
        value={value}
      />
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
          "flex h-[18px] w-[18px] items-center justify-center rounded-full border-2",
          selected ? "border-[#837CFF]" : "border-[#D0D5DD]",
        )}
      >
        {selected ? <span className="h-2 w-2 rounded-full bg-[#837CFF]" /> : null}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101828]/20">
      <section className="w-[480px] rounded-xl border border-[#E0E4EB] bg-white p-6 shadow-[0_20px_60px_rgba(16,24,40,0.16)]">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold leading-7 text-[#101828]">{title}</h2>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#667085] hover:bg-[#F3F4F6]"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </section>
    </div>
  );
}

function parseMonthDay(value: string) {
  const match = value.match(/(\d{1,2})\/(\d{1,2})/);

  if (!match) return null;

  return new Date(2026, Number(match[1]) - 1, Number(match[2]));
}

function getDateRangeBounds(rangeLabel: string) {
  const matches = [...rangeLabel.matchAll(/(\d{1,2})\/(\d{1,2})/g)];

  if (matches.length < 1) return null;

  return {
    start: new Date(2026, Number(matches[0][1]) - 1, Number(matches[0][2])),
    end: new Date(
      2026,
      Number((matches[1] ?? matches[0])[1]) - 1,
      Number((matches[1] ?? matches[0])[2]),
    ),
  };
}

function isWithinDateRange(value: string, rangeLabel: string) {
  const deadline = parseMonthDay(value);
  const range = getDateRangeBounds(rangeLabel);

  if (!deadline || !range) return false;

  return (
    deadline.getTime() >= range.start.getTime() &&
    deadline.getTime() <= range.end.getTime()
  );
}

const calendarYear = 2026;
const calendarMonthIndex = 6;
const calendarWeekdays = ["일", "월", "화", "수", "목", "금", "토"];
const calendarLeadingDays = new Date(calendarYear, calendarMonthIndex, 1).getDay();

const calendarCandidateDates = Array.from({ length: 31 }, (_, index) => {
  const date = new Date(calendarYear, calendarMonthIndex, index + 1);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = calendarWeekdays[date.getDay()];

  return {
    id: `date-${month}-${day}`,
    day,
    label: `${month}/${day} (${weekday})`,
  };
});

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

const registeredTeamSchedules = [
  {
    name: "허혜경",
    schedules: ["수 14:00~15:00 디자인 리뷰", "목 10:00~11:00 팀 싱크"],
  },
  { name: "김민서", schedules: ["수 15:00~17:00 개발 작업"] },
  { name: "박준호", schedules: ["목 오전 외근"] },
  { name: "윤서연", schedules: ["금 13:00~14:00 QA 확인"] },
  { name: "윤지은", schedules: [] },
  { name: "박은주", schedules: ["목 16:00~17:00 고객 미팅"] },
];

const availableDateSummaries = [
  { id: "date-7-13", label: "가능 6명 · 7/13(월)" },
  { id: "date-7-14", label: "가능 5명 · 7/14(화)" },
  { id: "date-7-15", label: "가능 5명 · 7/15(수)" },
];

export function MeetingCreateCard({ options }: MeetingCreateCardProps) {
  const navigate = useNavigate();
  const { meeting, updateMeeting, summaries } = useMeetingFlow();
  const [modal, setModal] = useState<ModalType>(null);
  const [draftDateIds, setDraftDateIds] = useState<string[]>([]);
  const [timeInputs, setTimeInputs] = useState<Record<string, string>>({});
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

  function openDateModal() {
    setDraftDateIds(selectedDateIdsFromLabel(summaries.dateRange));
    setModal("dateRange");
  }

  function openTeamScheduleModal() {
    setModal("teamSchedule");
  }

  function openTimesModal() {
    setDraftTimeIds(meeting.timeIds);
    setDraftCustomTimeOptions(meeting.customTimeOptions);
    setTimeInputs({});
    setModal("times");
  }

  function toggleDate(dateId: string) {
    setDraftDateIds((current) =>
      current.includes(dateId)
        ? current.filter((id) => id !== dateId)
        : [...current, dateId],
    );
  }

  function addTimeForDate(date: SelectOption) {
    const value = (timeInputs[date.id] ?? "").trim();

    if (!value) return;

    const id = `custom-time-${date.id}-${value.replace(/\D/g, "")}`;
    const option = { id, label: `${date.label} ${value}` };

    setDraftCustomTimeOptions((current) =>
      current.some((item) => item.id === id) ? current : [...current, option],
    );
    setDraftTimeIds((current) => (current.includes(id) ? current : [...current, id]));
    setTimeInputs((current) => ({ ...current, [date.id]: "" }));
  }

  function removeTime(timeId: string) {
    setDraftCustomTimeOptions((current) =>
      current.filter((option) => option.id !== timeId),
    );
    setDraftTimeIds((current) => current.filter((id) => id !== timeId));
  }

  function renderModal() {
    if (modal === "teamSchedule") {
      return (
        <ChoiceModal onClose={() => setModal(null)} title="팀원 일정 (6명)">
          <p className="mb-4 text-sm font-medium leading-[21px] text-[#667085]">
            회의 전 팀원들의 등록된 일정을 확인하세요.
          </p>
          <div className="max-h-[300px] space-y-3 overflow-y-auto pr-1">
            {registeredTeamSchedules.map((item) => (
              <div
                className="rounded-lg border border-[#E0E4EB] bg-[#F9FAFB] px-4 py-3"
                key={item.name}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="text-sm font-bold leading-[21px] text-[#101828]">
                    {item.name}
                  </div>
                  {item.schedules.length === 0 ? (
                    <span className="rounded-full bg-[#F3F4F6] px-2 py-[3px] text-xs font-bold leading-[18px] text-[#98A2B3]">
                      미등록
                    </span>
                  ) : null}
                </div>
                {item.schedules.length > 0 ? (
                  <div className="mt-2 space-y-1">
                    {item.schedules.map((schedule) => (
                      <div
                        className="text-sm font-medium leading-[21px] text-[#475467]"
                        key={schedule}
                      >
                        {schedule}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-2 text-sm font-medium leading-[21px] text-[#98A2B3]">
                    등록된 일정이 없습니다.
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-lg border border-[#E0E4EB] bg-white px-4 py-3">
            <h3 className="text-sm font-bold leading-[21px] text-[#101828]">
              일정 집계 결과
            </h3>
            <div className="mt-3 space-y-2">
              {availableDateSummaries.map((item) => (
                <div
                  className="text-sm font-medium leading-[21px] text-[#475467]"
                  key={item.id}
                >
                  {item.label}
                </div>
              ))}
            </div>
          </div>
          <Button
            className="mt-5 h-11 w-full rounded-lg bg-[#635BFF] text-sm font-bold leading-[21px] text-white hover:bg-[#635BFF]/90 active:bg-[#554DE8]"
            onClick={openDateModal}
          >
            후보 날짜 선택하기
          </Button>
        </ChoiceModal>
      );
    }

    if (modal === "attendees") {
      return (
        <ChoiceModal onClose={() => setModal(null)} title="참석자 선택">
          <div className="space-y-3">
            {attendees.map((attendee) => {
              const selected = meeting.attendeeIds.includes(attendee.id);
              const required = meeting.requiredAttendeeIds.includes(attendee.id);

              return (
                <div
                  className="flex h-[58px] items-center justify-between rounded-lg border border-[#E0E4EB] bg-[#F9FAFB] px-4"
                  key={attendee.id}
                >
                  <button
                    className="flex flex-1 items-center text-left"
                    onClick={() => toggleAttendee(attendee.id)}
                    type="button"
                  >
                    <AvatarBadge color={attendee.color} initial={attendee.initial} />
                    <span className="ml-3">
                      <span className="block text-sm font-bold leading-[21px] text-[#101828]">
                        {attendee.name}
                      </span>
                      <span className="block text-xs font-medium leading-[18px] text-[#808CA1]">
                        {attendee.role}
                      </span>
                    </span>
                  </button>
                  <div className="flex items-center gap-3">
                    <button
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-bold leading-[18px]",
                        selected
                          ? "bg-[#F7F6FF] text-[#837CFF]"
                          : "bg-[#F3F4F6] text-[#98A2B3]",
                      )}
                      onClick={() => toggleAttendee(attendee.id)}
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
                      onClick={() => toggleRequired(attendee.id)}
                      type="button"
                    >
                      필수
                    </button>
                  </div>
                </div>
              );
            })}
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
              2026년 7월
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

                return (
                  <button
                    aria-pressed={selected}
                    className={cn(
                      "flex h-11 items-center justify-center rounded-lg border text-sm font-bold leading-[21px] transition-colors",
                      selected
                        ? "border-[#837CFF] bg-[#837CFF] text-white"
                        : "border-transparent bg-white text-[#475467] hover:border-[#C9C5FF] hover:bg-[#F7F6FF] hover:text-[#837CFF]",
                    )}
                    key={date.id}
                    onClick={() => toggleDate(date.id)}
                    type="button"
                  >
                    {date.day}
                  </button>
                );
              })}
            </div>
          </div>
          <Button
            className="mt-4 h-12 w-full rounded-lg bg-[#635BFF] text-sm font-bold leading-[21px] text-white hover:bg-[#635BFF]/90 disabled:bg-[#C9CED8] disabled:text-white"
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
              });
              setModal(null);
            }}
          >
            선택 완료
          </Button>
        </ChoiceModal>
      );
    }

    if (modal === "times") {
      const selectedDates = selectedDateLabelsFromMeeting(summaries.dateRange);

      return (
        <ChoiceModal onClose={() => setModal(null)} title="후보 시간 선택">
          {selectedDates.length > 0 ? (
            <>
              <p className="mb-3 text-xs font-medium leading-[18px] text-[#94A3B8]">
                선택한 날짜별 후보 시간을 직접 추가하거나 삭제하세요.
              </p>
              <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
                {selectedDates.map((date) => {
                  const dateTimes = draftCustomTimeOptions.filter((option) =>
                    option.label.startsWith(date.label),
                  );

                  return (
                    <div
                      className="rounded-lg border border-[#E0E4EB] bg-[#F9FAFB] p-3"
                      key={date.id}
                    >
                      <div className="text-sm font-bold leading-[21px] text-[#101828]">
                        {date.label}
                      </div>
                      <div className="mt-3 flex gap-2">
                        <input
                          className="h-10 min-w-0 flex-1 rounded-lg border border-[#E0E4EB] bg-white px-3 text-sm font-medium leading-[21px] text-[#101828] outline-none focus:border-[#635BFF]"
                          onChange={(event) =>
                            setTimeInputs((current) => ({
                              ...current,
                              [date.id]: event.target.value,
                            }))
                          }
                          placeholder="예: 14:00"
                          value={timeInputs[date.id] ?? ""}
                        />
                        <Button
                          className="h-10 rounded-lg bg-[#635BFF] px-4 text-sm font-bold leading-[21px] text-white hover:bg-[#635BFF]/90"
                          onClick={() => addTimeForDate(date)}
                        >
                          추가
                        </Button>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {dateTimes.length > 0 ? (
                          dateTimes.map((option) => (
                            <button
                              className="rounded-full border border-[#837CFF] bg-white px-3 py-1 text-xs font-bold leading-[18px] text-[#837CFF]"
                              key={option.id}
                              onClick={() => removeTime(option.id)}
                              type="button"
                            >
                              {option.label.replace(`${date.label} `, "")} 삭제
                            </button>
                          ))
                        ) : (
                          <span className="text-xs font-medium leading-[18px] text-[#98A2B3]">
                            추가된 시간이 없습니다.
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <Button
                className="mt-4 h-12 w-full rounded-lg bg-[#635BFF] text-sm font-bold leading-[21px] text-white hover:bg-[#635BFF]/90 disabled:bg-[#C9CED8] disabled:text-white"
                disabled={draftTimeIds.length === 0}
                onClick={() => {
                  updateMeeting({
                    timeIds: draftTimeIds,
                    customTimeOptions: draftCustomTimeOptions,
                  });
                  setModal(null);
                }}
              >
                선택 완료
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
          {deadlineOptions.length > 0 ? (
            <OptionList
              onSelect={(id) => {
                updateMeeting({ deadlineId: id, customDeadline: "" });
                setModal(null);
              }}
              options={deadlineOptions}
              selectedIds={[meeting.deadlineId]}
            />
          ) : (
            <p className="text-sm font-medium leading-[21px] text-[#667085]">
              후보 날짜를 먼저 선택해주세요.
            </p>
          )}
          {deadlineOptions.length > 0 ? (
            <CustomInput
              buttonLabel="직접 입력하기"
              inputMode="text"
              onCancel={() => {
                setShowCustomDeadline(false);
                setCustomDeadlineInput("");
              }}
              onSubmit={() => {
                const value = customDeadlineInput.trim();
                if (!value || !isWithinDateRange(value, summaries.dateRange)) return;
                updateMeeting({
                  customDeadline: value,
                  deadlineId: "custom-deadline",
                });
                setCustomDeadlineInput("");
                setShowCustomDeadline(false);
                setModal(null);
              }}
              onToggle={() => setShowCustomDeadline(true)}
              placeholder="예: 7/12 (일) 18:00"
              setValue={setCustomDeadlineInput}
              show={showCustomDeadline}
              suffix=""
              value={customDeadlineInput}
            />
          ) : null}
        </ChoiceModal>
      );
    }

    return null;
  }

  return (
    <>
      <section className="h-[744px] w-[880px] rounded-xl border border-[#E0E4EB] bg-white px-7 py-6">
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

        <div className="mt-10 grid w-[824px] grid-cols-2 grid-rows-3 gap-x-8 gap-y-5">
          <TitleField
            onChange={(title) => updateMeeting({ title })}
            value={meeting.title}
          />
          <Field
            badge
            label="2. 팀원 일정"
            onClick={openTeamScheduleModal}
            value="일정 확인 (6명)"
          />
          <Field
            label="3. 후보 날짜"
            onClick={openDateModal}
            placeholder={summaries.dateRange === "후보 날짜 선택"}
            value={summaries.dateRange}
          />
          <Field
            helper="2~5개 선택"
            label="4. 후보 시간"
            onClick={openTimesModal}
            placeholder={meeting.timeIds.length === 0}
            value={summaries.timeCount}
          />
          <Field
            label="5. 참석자"
            onClick={() => setModal("attendees")}
            value={summaries.requiredLabel}
          />
          <Field
            label="6. 응답 마감"
            onClick={() => setModal("deadline")}
            placeholder={summaries.deadline === "응답 마감 선택"}
            value={summaries.deadline}
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
                onClick={() =>
                  updateMeeting({ unansweredOnly: !meeting.unansweredOnly })
                }
                type="button"
              >
                <span
                  className={cn(
                    "flex h-[18px] w-[18px] items-center justify-center rounded border",
                    meeting.unansweredOnly
                      ? "border-[#837CFF] bg-[#837CFF] text-white"
                      : "border-[#D0D5DD] bg-white text-transparent",
                  )}
                >
                  <Check className="h-[11px] w-[11px]" strokeWidth={3} />
                </span>
                응답하지 않은 사람에게만 발송
              </button>
              <div className="flex h-[70px] w-[360px] items-center rounded-lg border border-[#E0E4EB] bg-[#F9FAFB] px-[17px]">
                <p className="w-[231px] text-[13px] font-medium leading-5 text-[#475467]">
                  {summaries.reminderText}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <CustomReminderOption
                disabled={!meeting.reminderEnabled}
                onSelect={() => updateMeeting({ reminderId: "custom-reminder" })}
                onValueChange={(value) =>
                  updateMeeting({
                    customReminderHours: value,
                    reminderId: "custom-reminder",
                  })
                }
                selected={meeting.reminderId === "custom-reminder"}
                value={meeting.customReminderHours}
              />
              {options.reminders.map((option) => (
                <ReminderOption
                  disabled={!meeting.reminderEnabled}
                  key={option.id}
                  label={option.label}
                  onClick={() =>
                    updateMeeting({
                      customReminderHours: "",
                      reminderId: option.id,
                    })
                  }
                  selected={option.id === meeting.reminderId}
                />
              ))}
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
  value,
  onSelect,
  onValueChange,
}: {
  selected: boolean;
  disabled: boolean;
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
            "flex h-[18px] w-[18px] items-center justify-center rounded-full border-2",
            selected ? "border-[#837CFF]" : "border-[#D0D5DD]",
          )}
        >
          {selected ? (
            <span className="h-2 w-2 rounded-full bg-[#837CFF]" />
          ) : null}
        </span>
        <span>직접 입력</span>
      </button>
      {selected ? (
        <div className="flex items-center gap-2 pb-3 pl-[30px]">
          <span className="text-sm font-medium leading-[21px] text-[#475467]">
            마감
          </span>
          <input
            className="h-9 w-16 rounded-lg border border-[#E0E4EB] bg-white px-3 text-center text-sm font-medium leading-[21px] text-[#101828] outline-none focus:border-[#635BFF]"
            inputMode="numeric"
            onChange={(event) => onValueChange(event.target.value)}
            placeholder="6"
            type="number"
            value={value}
          />
          <span className="text-sm font-medium leading-[21px] text-[#475467]">
            시간 전
          </span>
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
