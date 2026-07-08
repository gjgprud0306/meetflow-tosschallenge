import { ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MeetingCreateMock } from "@/types/meeting";
import { cn } from "@/lib/utils";

type MeetingCreateCardProps = {
  meeting: MeetingCreateMock;
};

type FieldProps = {
  label: string;
  value: string;
  helper?: string;
  centered?: boolean;
  badge?: boolean;
  action?: string;
  offsetTop?: boolean;
};

function Field({
  label,
  value,
  helper,
  centered = false,
  badge = false,
  action,
  offsetTop = false,
}: FieldProps) {
  return (
    <div className={cn("w-96", offsetTop && "pt-5")}>
      <div className="mb-2 flex h-5 w-[360px] items-center justify-between">
        <div className="text-[13px] font-bold leading-5 text-[#101828]">
          {label}
        </div>
        {action ? (
          <button className="text-xs font-medium leading-[18px] text-[#635BFF]">
            {action}
          </button>
        ) : null}
        {helper ? (
          <div className="text-[11px] font-medium leading-[17px] text-[#94A3B8]">
            {helper}
          </div>
        ) : null}
      </div>
      <div className="flex h-12 w-[360px] items-center justify-between rounded-lg border border-[#E0E4EB] bg-[#F9FAFB] px-[17px]">
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
      </div>
    </div>
  );
}

function ReminderOption({
  label,
  selected = false,
}: {
  label: string;
  selected?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex h-12 w-[360px] items-center gap-3 rounded-lg border px-[17px]",
        selected
          ? "border-[#635BFF] bg-[#F0EFFF] text-[#635BFF]"
          : "border-[#E0E4EB] bg-[#F9FAFB] text-[#475467]",
      )}
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
    </div>
  );
}

export function MeetingCreateCard({ meeting }: MeetingCreateCardProps) {
  return (
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
        <Button className="h-12 w-40 rounded-lg bg-[#635BFF] text-sm font-bold leading-[21px] text-white hover:bg-[#635BFF]/90">
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
          value={meeting.attendeesLabel}
        />
        <Field label="3. 후보 기간" value={meeting.dateRange} />
        <Field
          centered
          helper="2~5개 선택"
          label="4. 후보 시간"
          value={meeting.timeCount}
        />
        <Field
          centered
          label="5. 필수 참석자"
          value={meeting.requiredAttendees}
        />
        <div className="pt-7">
          <Field label="6. 응답 마감" value={meeting.deadline} />
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
              <button className="relative h-6 w-11 rounded-full bg-[#635BFF]">
                <span className="absolute left-[23px] top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow" />
              </button>
            </div>
            <button className="mt-5 flex items-center gap-2.5 rounded text-sm font-medium leading-[21px] text-[#101828]">
              <span className="flex h-[18px] w-[18px] items-center justify-center rounded bg-[#635BFF] text-white">
                <Check className="h-[11px] w-[11px]" strokeWidth={3} />
              </span>
              응답하지 않은 사람에게만 발송
            </button>
            <div className="mt-[15px] flex h-[70px] w-[360px] items-center rounded-lg border border-[#E0E4EB] bg-[#F9FAFB] px-[17px]">
              <p className="w-[231px] text-[13px] font-medium leading-5 text-[#475467]">
                {meeting.reminderText}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {["마감 24시간 전", "마감 3시간 전", "마감 1시간 전"].map(
              (label) => (
                <ReminderOption
                  key={label}
                  label={label}
                  selected={label === meeting.selectedReminder}
                />
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
