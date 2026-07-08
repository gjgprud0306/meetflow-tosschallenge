import { Check } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AvatarBadge } from "@/components/AvatarBadge";
import { MeetFlowLayout } from "@/components/MeetFlowLayout";
import { Button } from "@/components/ui/button";
import { createCandidateTimeOptions } from "@/context/meetingFlowUtils";
import { useMeetingFlow } from "@/context/useMeetingFlow";
import { cn } from "@/lib/utils";

type MeetingSchedulePageProps = {
  mode: "schedule" | "candidate";
};

const steps = ["회의 초대", "일정 확인", "후보 선택"] as const;

function ScheduleMessage() {
  return (
    <article className="flex items-start">
      <AvatarBadge color="muted" initial="혜" />
      <div className="ml-3">
        <div className="flex h-[21px] items-center gap-1.5">
          <span className="text-sm font-bold leading-[21px] text-[#101828]">
            혜경
          </span>
          <span className="text-xs font-normal leading-[18px] text-[#98A2B3]">
            오전 10:12
          </span>
        </div>
        <p className="mt-1 text-base font-normal leading-6 text-[#1D2939]">
          내 일정을 확인한 뒤 후보 시간을 확인해주세요.
        </p>
      </div>
    </article>
  );
}

function StepProgress({ activeStep }: { activeStep: 2 | 3 }) {
  return (
    <div>
      <div className="h-1 rounded-full bg-[#E5E7EB]">
        <div
          className={cn(
            "h-1 rounded-full bg-[#635BFF]",
            activeStep === 2 ? "w-1/3" : "w-2/3",
          )}
        />
      </div>
      <div className="mt-4 flex items-start">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const completed = stepNumber < activeStep;
          const active = stepNumber === activeStep;

          return (
            <div className="flex flex-1 items-start" key={step}>
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold leading-[18px]",
                    completed || active
                      ? "bg-[#635BFF] text-white"
                      : "bg-[#E8ECF2] text-[#98A2B3]",
                    active && "bg-white text-[#635BFF] ring-4 ring-[#F0EFFF]",
                  )}
                >
                  {completed ? (
                    <Check className="h-4 w-4" strokeWidth={3} />
                  ) : (
                    stepNumber
                  )}
                </div>
                <span
                  className={cn(
                    "mt-3 whitespace-nowrap text-xs font-medium leading-[18px]",
                    completed || active ? "text-[#635BFF]" : "text-[#98A2B3]",
                  )}
                >
                  {step}
                </span>
              </div>
              {index < steps.length - 1 ? (
                <div className="mx-4 mt-3 h-px flex-1 bg-[#E0E4EB]" />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ScheduleCard() {
  const navigate = useNavigate();

  return (
    <section className="w-full max-w-[880px] overflow-hidden rounded-xl border border-[#E0E4EB] bg-white shadow-[0_4px_16px_rgba(16,24,40,0.08)]">
      <div className="flex h-[76px] items-center bg-[#F0EFFF] px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#635BFF] text-xl font-bold leading-[30px] text-white">
          15
        </div>
        <h2 className="ml-4 text-lg font-bold leading-7 text-[#101828]">
          내 일정 확인
        </h2>
      </div>

      <div className="px-6 py-5">
        <h3 className="text-xl font-bold leading-[30px] text-[#101828]">
          내 일정 요약
        </h3>
        <p className="mt-2 text-sm font-medium leading-[21px] text-[#475467]">
          불가능한 시간을 확인해 주세요
        </p>

        <div className="mt-3 rounded-lg border border-[#E0E4EB] bg-white px-5 py-5">
          <h4 className="text-sm font-bold leading-[21px] text-[#101828]">
            내 일정
          </h4>
          <ul className="mt-4 space-y-4 text-sm font-medium leading-[21px] text-[#475467]">
            <li className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[#635BFF]" />
              화요일 오후 외근
            </li>
            <li className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[#635BFF]" />
              수요일 점심 제외
            </li>
            <li className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[#635BFF]" />
              목요일 오전 일정
            </li>
          </ul>
        </div>

        <div className="mt-4">
          <StepProgress activeStep={2} />
        </div>

        <Button
          className="mt-6 h-12 w-full rounded-lg bg-[#635BFF] text-base font-bold leading-6 text-white hover:bg-[#635BFF]/90 active:bg-[#554DE8]"
          onClick={() => navigate("/meetings/candidate-select")}
        >
          후보 시간 보기
        </Button>
      </div>
    </section>
  );
}

function CandidateSelectCard() {
  const { meeting } = useMeetingFlow();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const options = [
    ...createCandidateTimeOptions(meeting),
    ...meeting.customTimeOptions,
  ].filter((option) =>
    meeting.timeIds.length > 0 ? meeting.timeIds.includes(option.id) : true,
  );

  function toggleCandidate(optionId: string) {
    setSelectedIds((current) =>
      current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId],
    );
  }

  return (
    <section className="w-full max-w-[880px] overflow-hidden rounded-xl border border-[#E0E4EB] bg-white shadow-[0_4px_16px_rgba(16,24,40,0.08)]">
      <div className="flex h-[76px] items-center bg-[#F0EFFF] px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#635BFF] text-xl font-bold leading-[30px] text-white">
          15
        </div>
        <div className="ml-4">
          <h2 className="text-lg font-bold leading-7 text-[#101828]">
            {meeting.title || "회의"}
          </h2>
          <p className="mt-1 text-sm font-medium leading-[21px] text-[#475467]">
            가능한 후보 시간을 선택해주세요
          </p>
        </div>
      </div>

      <div className="px-6 py-5">
        <h3 className="text-xl font-bold leading-[30px] text-[#101828]">
          후보 시간 선택
        </h3>
        <p className="mt-2 text-sm font-medium leading-[21px] text-[#475467]">
          참석 가능한 시간을 모두 선택해 주세요.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {options.map((option) => {
            const selected = selectedIds.includes(option.id);

            return (
              <button
                className={cn(
                  "flex h-14 items-center justify-between rounded-lg border px-4 text-left text-sm font-bold leading-[21px]",
                  selected
                    ? "border-[#635BFF] bg-[#F0EFFF] text-[#635BFF]"
                    : "border-[#E0E4EB] bg-[#F9FAFB] text-[#475467]",
                )}
                key={option.id}
                onClick={() => toggleCandidate(option.id)}
                type="button"
              >
                {option.label}
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
              </button>
            );
          })}
        </div>

        <div className="mt-6">
          <StepProgress activeStep={3} />
        </div>

        <Button className="mt-6 h-12 w-full rounded-lg bg-[#635BFF] text-base font-bold leading-6 text-white hover:bg-[#635BFF]/90 active:bg-[#554DE8]">
          응답 제출
        </Button>
      </div>
    </section>
  );
}

function ScheduleComposer() {
  return (
    <div className="absolute bottom-0 left-0 flex h-[104px] w-full items-center gap-[34px] border-t border-[#E0E4EB] bg-white px-8 py-4">
      <div className="flex h-12 min-w-0 flex-1 items-center rounded-lg border border-[#E0E4EB] bg-[#F9FAFB]/80 px-4">
        <span className="text-sm font-medium leading-[21px] text-[#C9CED8]">
          채팅 중 일정 조율이 필요하면 회의를 만들어보세요
        </span>
      </div>
      <Button className="h-12 w-40 rounded-lg bg-[#AAA3FF] text-base font-bold leading-6 text-white hover:bg-[#9B93FF]">
        회의 만들기
      </Button>
    </div>
  );
}

export function MeetingSchedulePage({ mode }: MeetingSchedulePageProps) {
  return (
    <MeetFlowLayout>
      <div className="relative h-full w-full bg-white">
        <div className="h-full w-full overflow-y-auto px-8 pb-[132px] pt-7">
          <div className="flex flex-col gap-6">
            <ScheduleMessage />
            {mode === "schedule" ? <ScheduleCard /> : <CandidateSelectCard />}
          </div>
        </div>
        <ScheduleComposer />
      </div>
    </MeetFlowLayout>
  );
}
