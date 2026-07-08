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

type ModalType = "attendees" | "dateRange" | "times" | "deadline" | null;

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
          <span className="rounded-full bg-[#F0EFFF] px-2 py-[3px] text-xs font-bold leading-[18px] text-[#635BFF]">
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
        {label !== "1. 회의 제목" && label !== "2. 참석자" ? (
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
          ? "border-[#635BFF] bg-[#F0EFFF] text-[#635BFF]"
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
          selected ? "border-[#635BFF]" : "border-[#D0D5DD]",
        )}
      >
        {selected ? <span className="h-2 w-2 rounded-full bg-[#635BFF]" /> : null}
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

function isBeforeDate(value: string, rangeLabel: string) {
  const deadline = parseMonthDay(value);
  const start = parseMonthDay(rangeLabel);

  if (!deadline || !start) return false;

  return deadline.getTime() < start.getTime();
}

export function MeetingCreateCard({ options }: MeetingCreateCardProps) {
  const navigate = useNavigate();
  const { meeting, updateMeeting, summaries } = useMeetingFlow();
  const [modal, setModal] = useState<ModalType>(null);
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [customDateInput, setCustomDateInput] = useState("");
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [customTimeInput, setCustomTimeInput] = useState("");
  const [showCustomDeadline, setShowCustomDeadline] = useState(false);
  const [customDeadlineInput, setCustomDeadlineInput] = useState("");
  const deadlineOptions = createDeadlineOptions(meeting);
  const canSubmit =
    meeting.title.trim().length > 0 &&
    summaries.dateRange !== "후보 기간 선택" &&
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

  function toggleTime(timeId: string) {
    if (meeting.timeIds.includes(timeId)) {
      updateMeeting({
        timeIds:
          meeting.timeIds.length > 2
            ? meeting.timeIds.filter((id) => id !== timeId)
            : meeting.timeIds,
      });
      return;
    }

    updateMeeting({
      timeIds:
        meeting.timeIds.length < 5
          ? [...meeting.timeIds, timeId]
          : meeting.timeIds,
    });
  }

  function renderModal() {
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
                          ? "bg-[#F0EFFF] text-[#635BFF]"
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
                          ? "bg-[#635BFF] text-white"
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
        <ChoiceModal onClose={() => setModal(null)} title="후보 기간 선택">
          <OptionList
            onSelect={(id) => {
              updateMeeting({
                dateRangeId: id,
                deadlineId: "",
                customDeadline: "",
              });
              setModal(null);
            }}
            options={options.dateRanges}
            selectedIds={[meeting.dateRangeId]}
          />
          <CustomInput
            buttonLabel="직접 입력하기"
            inputMode="text"
            onCancel={() => {
              setShowCustomDate(false);
              setCustomDateInput("");
            }}
            onSubmit={() => {
              const value = customDateInput.trim();
              if (!value) return;
              updateMeeting({
                customDateRange: value,
                dateRangeId: "custom-date-range",
                deadlineId: "",
                customDeadline: "",
              });
              setCustomDateInput("");
              setShowCustomDate(false);
              setModal(null);
            }}
            onToggle={() => setShowCustomDate(true)}
            placeholder="예: 7/16 (목) ~ 7/17 (금)"
            setValue={setCustomDateInput}
            show={showCustomDate}
            suffix=""
            value={customDateInput}
          />
        </ChoiceModal>
      );
    }

    if (modal === "times") {
      return (
        <ChoiceModal onClose={() => setModal(null)} title="후보 시간 선택">
          <p className="mb-3 text-xs font-medium leading-[18px] text-[#94A3B8]">
            2~5개까지 선택할 수 있습니다.
          </p>
          <OptionList
            multiple
            onSelect={toggleTime}
            options={[...options.candidateTimes, ...meeting.customTimeOptions]}
            selectedIds={meeting.timeIds}
          />
          <CustomInput
            buttonLabel="직접 입력하기"
            inputMode="text"
            onCancel={() => {
              setShowCustomTime(false);
              setCustomTimeInput("");
            }}
            onSubmit={() => {
              const value = customTimeInput.trim();
              const alreadySelected = meeting.customTimeOptions.some(
                (option) => option.label === value && meeting.timeIds.includes(option.id),
              );
              if (!value || (meeting.timeIds.length >= 5 && !alreadySelected)) return;
              const id = `custom-time-${value.replace(/\s+/g, "-")}`;
              const exists = meeting.customTimeOptions.some(
                (option) => option.id === id,
              );
              updateMeeting({
                customTimeOptions: exists
                  ? meeting.customTimeOptions
                  : [...meeting.customTimeOptions, { id, label: value }],
                timeIds: meeting.timeIds.includes(id)
                  ? meeting.timeIds
                  : [...meeting.timeIds, id],
              });
              setCustomTimeInput("");
              setShowCustomTime(false);
            }}
            onToggle={() => setShowCustomTime(true)}
            placeholder="예: 금 17:00"
            setValue={setCustomTimeInput}
            show={showCustomTime}
            suffix=""
            value={customTimeInput}
          />
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
              후보 기간을 먼저 선택해주세요.
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
                if (!value || !isBeforeDate(value, summaries.dateRange)) return;
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
            <h2 className="text-xl font-bold leading-[30px] text-[#101828]">
              회의 생성
            </h2>
            <p className="mt-1 text-[13px] font-medium leading-5 text-[#475467]">
              채팅에서 회의 카드를 만듭니다
            </p>
          </div>
          <Button
            className="h-12 w-40 rounded-lg bg-[#635BFF] text-sm font-bold leading-[21px] text-white hover:bg-[#635BFF]/90 disabled:bg-[#C9CED8] disabled:text-white"
            disabled={!canSubmit}
            onClick={() => navigate("/meetings/response-status")}
          >
            응답 요청 보내기
          </Button>
        </div>

        <div className="mt-10 flex w-[824px] flex-col gap-5">
          <div className="flex h-[76px] items-start gap-8">
            <TitleField
              onChange={(title) => updateMeeting({ title })}
              value={meeting.title}
            />
            <Field
              action="참석자 편집"
              badge
              label="2. 참석자"
              onClick={() => setModal("attendees")}
              value={summaries.attendeesLabel}
            />
          </div>
          <div className="flex h-[76px] items-start gap-8">
            <Field
              label="3. 후보 기간"
              onClick={() => setModal("dateRange")}
              placeholder={summaries.dateRange === "후보 기간 선택"}
              value={summaries.dateRange}
            />
            <Field
              helper="2~5개 선택"
              label="4. 후보 시간"
              onClick={() => setModal("times")}
              placeholder={meeting.timeIds.length === 0}
              value={summaries.timeCount}
            />
          </div>
          <div className="flex h-[76px] items-start gap-8">
            <Field
              label="5. 필수 참석자"
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
                    meeting.reminderEnabled ? "bg-[#635BFF]" : "bg-[#D0D5DD]",
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
                      ? "border-[#635BFF] bg-[#635BFF] text-white"
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
          ? "border-[#635BFF] bg-[#F0EFFF] text-[#635BFF]"
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
            selected ? "border-[#635BFF]" : "border-[#D0D5DD]",
          )}
        >
          {selected ? (
            <span className="h-2 w-2 rounded-full bg-[#635BFF]" />
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
                ? "border-[#635BFF] bg-[#F0EFFF] text-[#635BFF]"
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
                selected ? "border-[#635BFF]" : "border-[#D0D5DD]",
                multiple && "rounded",
              )}
            >
              {selected ? <span className="h-2 w-2 rounded-full bg-[#635BFF]" /> : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
