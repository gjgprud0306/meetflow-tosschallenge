import { Check, ChevronRight, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AvatarBadge } from "@/components/AvatarBadge";
import { Button } from "@/components/ui/button";
import { attendees } from "@/mocks";
import { cn } from "@/lib/utils";
import type {
  MeetingCreateMock,
  MeetingCreateOptions,
  SelectOption,
} from "@/types/meeting";

type MeetingCreateCardProps = {
  meeting: MeetingCreateMock;
  options: MeetingCreateOptions;
};

type ModalType = "attendees" | "dateRange" | "times" | "deadline" | null;

type FieldProps = {
  label: string;
  value: string;
  helper?: string;
  centered?: boolean;
  badge?: boolean;
  action?: string;
  offsetTop?: boolean;
  onClick?: () => void;
};

function byId(options: SelectOption[], id: string) {
  return options.find((option) => option.id === id)?.label ?? "";
}

function Field({
  label,
  value,
  helper,
  centered = false,
  badge = false,
  action,
  offsetTop = false,
  onClick,
}: FieldProps) {
  return (
    <div className={cn("w-96", offsetTop && "pt-5")}>
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
              "text-sm font-medium leading-[21px] text-[#101828]",
              centered && "w-[180px] text-center",
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

export function MeetingCreateCard({ meeting, options }: MeetingCreateCardProps) {
  const navigate = useNavigate();
  const [modal, setModal] = useState<ModalType>(null);
  const [attendeeIds, setAttendeeIds] = useState(meeting.attendeeIds);
  const [requiredAttendeeIds, setRequiredAttendeeIds] = useState(
    meeting.requiredAttendeeIds,
  );
  const [dateRangeId, setDateRangeId] = useState(meeting.dateRangeId);
  const [timeIds, setTimeIds] = useState(meeting.timeIds);
  const [deadlineId, setDeadlineId] = useState(meeting.deadlineId);
  const [reminderEnabled, setReminderEnabled] = useState(
    meeting.reminderEnabled,
  );
  const [unansweredOnly, setUnansweredOnly] = useState(meeting.unansweredOnly);
  const [reminderId, setReminderId] = useState(meeting.reminderId);

  const attendeeLabel = `${attendeeIds.length}명 선택 · 필수 ${requiredAttendeeIds.length}명`;
  const requiredLabel =
    requiredAttendeeIds.length > 1
      ? `${attendees.find((attendee) => attendee.id === requiredAttendeeIds[0])?.name.slice(-2) ?? "혜경"} 외 ${
          requiredAttendeeIds.length - 1
        }명`
      : (attendees.find((attendee) => attendee.id === requiredAttendeeIds[0])
          ?.name ?? "선택 없음");
  const selectedReminder = byId(options.reminders, reminderId);
  const deadline = byId(options.deadlines, deadlineId);
  const reminderText = reminderEnabled
    ? `${unansweredOnly ? "미응답자에게" : "참석자에게"} ${selectedReminder}에 자동 리마인드를 보냅니다. (마감: ${deadline})`
    : "자동 리마인드를 사용하지 않습니다.";

  function toggleAttendee(attendeeId: string) {
    setAttendeeIds((current) => {
      if (current.includes(attendeeId)) {
        setRequiredAttendeeIds((required) =>
          required.filter((id) => id !== attendeeId),
        );
        return current.filter((id) => id !== attendeeId);
      }

      return [...current, attendeeId];
    });
  }

  function toggleRequired(attendeeId: string) {
    if (!attendeeIds.includes(attendeeId)) return;
    setRequiredAttendeeIds((current) =>
      current.includes(attendeeId)
        ? current.filter((id) => id !== attendeeId)
        : [...current, attendeeId],
    );
  }

  function toggleTime(timeId: string) {
    setTimeIds((current) => {
      if (current.includes(timeId)) {
        return current.length > 2
          ? current.filter((id) => id !== timeId)
          : current;
      }

      return current.length < 5 ? [...current, timeId] : current;
    });
  }

  function renderModal() {
    if (modal === "attendees") {
      return (
        <ChoiceModal onClose={() => setModal(null)} title="참석자 선택">
          <div className="space-y-3">
            {attendees.map((attendee) => {
              const selected = attendeeIds.includes(attendee.id);
              const required = requiredAttendeeIds.includes(attendee.id);

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
              setDateRangeId(id);
              setModal(null);
            }}
            options={options.dateRanges}
            selectedIds={[dateRangeId]}
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
            options={options.candidateTimes}
            selectedIds={timeIds}
          />
        </ChoiceModal>
      );
    }

    if (modal === "deadline") {
      return (
        <ChoiceModal onClose={() => setModal(null)} title="응답 마감 선택">
          <OptionList
            onSelect={(id) => {
              setDeadlineId(id);
              setModal(null);
            }}
            options={options.deadlines}
            selectedIds={[deadlineId]}
          />
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
            className="h-12 w-40 rounded-lg bg-[#635BFF] text-sm font-bold leading-[21px] text-white hover:bg-[#635BFF]/90"
            onClick={() => navigate("/meetings/response-status")}
          >
            응답 요청 보내기
          </Button>
        </div>

        <div className="mt-5 grid h-[360px] w-[824px] grid-cols-[384px_384px] gap-x-8">
          <Field label="1. 회의 제목" offsetTop value={meeting.title} />
          <Field
            action="참석자 편집"
            badge
            label="2. 참석자"
            offsetTop
            onClick={() => setModal("attendees")}
            value={attendeeLabel}
          />
          <Field
            label="3. 후보 기간"
            onClick={() => setModal("dateRange")}
            value={byId(options.dateRanges, dateRangeId)}
          />
          <Field
            centered
            helper="2~5개 선택"
            label="4. 후보 시간"
            onClick={() => setModal("times")}
            value={`${timeIds.length}개 선택`}
          />
          <Field
            centered
            label="5. 필수 참석자"
            onClick={() => setModal("attendees")}
            value={requiredLabel}
          />
          <div className="pt-7">
            <Field
              label="6. 응답 마감"
              onClick={() => setModal("deadline")}
              value={deadline}
            />
          </div>
        </div>

        <div className="mt-5 h-64 w-[824px]">
          <h3 className="text-base font-bold leading-6 text-[#101828]">
            응답 리마인드
          </h3>
          <div className="mt-4 grid grid-cols-[360px_360px] gap-x-14">
            <div>
              <div className="flex h-8 items-center justify-between">
                <span className="text-sm font-medium leading-[21px] text-[#101828]">
                  자동 리마인드 사용
                </span>
                <button
                  className={cn(
                    "relative h-6 w-11 rounded-full transition-colors",
                    reminderEnabled ? "bg-[#635BFF]" : "bg-[#D0D5DD]",
                  )}
                  onClick={() => setReminderEnabled((current) => !current)}
                  type="button"
                >
                  <span
                    className={cn(
                      "absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow transition-all",
                      reminderEnabled ? "left-[23px]" : "left-[3px]",
                    )}
                  />
                </button>
              </div>
              <button
                className="mt-5 flex items-center gap-2.5 rounded text-sm font-medium leading-[21px] text-[#101828]"
                onClick={() => setUnansweredOnly((current) => !current)}
                type="button"
              >
                <span
                  className={cn(
                    "flex h-[18px] w-[18px] items-center justify-center rounded border",
                    unansweredOnly
                      ? "border-[#635BFF] bg-[#635BFF] text-white"
                      : "border-[#D0D5DD] bg-white text-transparent",
                  )}
                >
                  <Check className="h-[11px] w-[11px]" strokeWidth={3} />
                </span>
                응답하지 않은 사람에게만 발송
              </button>
              <div className="mt-[15px] flex h-[70px] w-[360px] items-center rounded-lg border border-[#E0E4EB] bg-[#F9FAFB] px-[17px]">
                <p className="w-[231px] text-[13px] font-medium leading-5 text-[#475467]">
                  {reminderText}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {options.reminders.map((option) => (
                <ReminderOption
                  disabled={!reminderEnabled}
                  key={option.id}
                  label={option.label}
                  onClick={() => setReminderId(option.id)}
                  selected={option.id === reminderId}
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
