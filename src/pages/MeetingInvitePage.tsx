import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AvatarBadge } from "@/components/AvatarBadge";
import { MeetFlowLayout } from "@/components/MeetFlowLayout";
import { Button } from "@/components/ui/button";
import { participantRequest } from "@/mocks/participantRequest";
import { cn } from "@/lib/utils";

function SystemMessage({ title }: { title: string }) {
  return (
    <article className="flex items-start">
      <AvatarBadge initial="M" />
      <div className="ml-3">
        <div className="flex h-[21px] items-center gap-1.5">
          <span className="text-sm font-bold leading-[21px] text-[#101828]">
            MFlow
          </span>
          <span className="text-xs font-normal leading-[18px] text-[#98A2B3]">
            오전 10:30
          </span>
        </div>
        <div className="mt-2 inline-flex h-11 items-center rounded-lg bg-[#F7F6FF] px-4 text-sm font-medium leading-[21px] text-[#6F6A9F]">
          {title}의 응답 요청이 도착했습니다.
        </div>
      </div>
    </article>
  );
}

function MeetingInfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex h-20 flex-col justify-center border-r border-[#E0E4EB] px-6 last:border-r-0">
      <span className="text-xs font-bold leading-[18px] text-[#98A2B3]">
        {label}
      </span>
      <span className="mt-2 text-xl font-bold leading-[30px] text-[#635BFF]">
        {value}
      </span>
    </div>
  );
}

const steps = [
  "회의 초대",
  "내 일정 확인",
  "후보 선택",
  "응답 제출",
] as const;

function ParticipantProgress() {
  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-sm font-bold leading-[21px] text-[#101828]">
          참여자 진행
        </h3>
        <span className="text-xs font-medium leading-[18px] text-[#98A2B3]">
          회의 초대 도착 · 내 일정 확인 전
        </span>
      </div>
      <div className="flex items-start">
        {steps.map((step, index) => {
          const active = index === 0;

          return (
            <div className="flex flex-1 items-start" key={step}>
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold leading-[18px]",
                    active
                      ? "bg-[#635BFF] text-white"
                      : "bg-[#E8ECF2] text-[#98A2B3]",
                  )}
                >
                  {active ? <Check className="h-4 w-4" strokeWidth={3} /> : index + 1}
                </div>
                <span
                  className={cn(
                    "mt-3 whitespace-nowrap text-xs font-medium leading-[18px]",
                    active ? "text-[#635BFF]" : "text-[#98A2B3]",
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

function InviteMeetingCard() {
  const navigate = useNavigate();
  const title = participantRequest.title;

  return (
    <section className="w-[680px] overflow-hidden rounded-xl border border-[#E0E4EB] bg-white shadow-[0_4px_16px_rgba(16,24,40,0.08)]">
      <div className="flex h-[82px] items-center justify-between bg-[#F7F6FF] px-6">
        <div className="flex items-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#635BFF] text-xl font-bold leading-[30px] text-white">
            15
          </div>
          <div className="ml-4">
            <h2 className="text-lg font-bold leading-7 text-[#101828]">
              {title}
            </h2>
            <p className="mt-1 text-sm font-medium leading-[21px] text-[#475467]">
              소요 시간 1시간 · 필수 참석자 포함
            </p>
          </div>
        </div>
        <span className="rounded-full bg-[#635BFF] px-3 py-1 text-xs font-bold leading-[18px] text-white">
          새 요청
        </span>
      </div>

      <div className="grid grid-cols-3 border-b border-[#E0E4EB]">
        <MeetingInfoCell label="소요 시간" value="1시간" />
        <MeetingInfoCell label="필수 참석" value="포함" />
        <MeetingInfoCell label="응답 마감" value={participantRequest.deadline} />
      </div>

      <div className="border-b border-[#E0E4EB] px-6 py-5">
        <ParticipantProgress />
      </div>

      <div className="flex h-20 items-center justify-between px-6">
        <div>
          <h3 className="text-base font-bold leading-6 text-[#101828]">
            내 일정을 확인한 뒤 후보 시간을 선택하세요
          </h3>
          <p className="mt-1 text-[13px] font-medium leading-5 text-[#98A2B3]">
            후보 시간은 일정 확인 후 선택할 수 있습니다.
          </p>
        </div>
        <Button
          className="h-12 w-36 rounded-lg bg-[#635BFF] text-base font-bold leading-6 text-white hover:bg-[#635BFF]/90"
          onClick={() => navigate("/requests/my-schedule")}
        >
          내 일정 확인하기
        </Button>
      </div>
    </section>
  );
}

function InviteRightPanel() {
  const title = participantRequest.title;

  return (
    <aside className="h-full w-[328px] shrink-0 border-l border-[#E5E7EB] bg-[#F9FAFB] px-6 pt-7">
      <h2 className="text-[26px] font-bold leading-9 text-[#101828]">
        회의 초대
      </h2>
      <p className="mt-2 text-sm font-medium leading-[21px] text-[#475467]">
        회의 정보를 확인하고 응답을 시작합니다
      </p>

      <section className="mt-6 rounded-xl border border-[#E0E4EB] bg-white p-5">
        <p className="text-sm font-bold leading-[21px] text-[#98A2B3]">
          응답 마감
        </p>
        <p className="mt-3 text-[26px] font-bold leading-9 text-[#635BFF]">
          {participantRequest.deadline}
        </p>
        <p className="mt-2 text-sm font-medium leading-[21px] text-[#475467]">
          가능한 시간을 선택해주세요.
        </p>
      </section>

      <section className="mt-5 rounded-xl border border-[#E0E4EB] bg-white p-5">
        <p className="text-sm font-bold leading-[21px] text-[#98A2B3]">
          회의 목적
        </p>
        <p className="mt-3 text-base font-bold leading-6 text-[#101828]">
          {title}
        </p>
      </section>

      <section className="mt-5 rounded-xl border border-[#E0E4EB] bg-white p-5">
        <div className="space-y-3 text-sm font-medium leading-[21px]">
          <div className="flex justify-between gap-4">
            <span className="text-[#98A2B3]">소요 시간</span>
            <span className="text-[#475467]">1시간</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-[#98A2B3]">필수 참석</span>
            <span className="text-[#475467]">
              {participantRequest.requiredAttendees}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-[#98A2B3]">후보 날짜</span>
            <span className="text-right text-[#475467]">
              {participantRequest.candidateDateLabel}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-[#98A2B3]">후보 시간</span>
            <span className="text-right text-[#475467]">
              {participantRequest.candidateTimes.join(", ")}
            </span>
          </div>
        </div>
      </section>

      <p className="mt-6 text-sm font-medium leading-[21px] text-[#475467]">
        응답 제출 전 가능한 시간을 확인해 주세요.
      </p>
    </aside>
  );
}

function InviteComposer() {
  return (
    <div className="absolute bottom-0 left-0 flex h-[104px] w-full items-center gap-[34px] border-t border-[#E0E4EB] bg-white px-8 py-4">
      <div className="flex h-12 min-w-0 flex-1 items-center rounded-lg border border-[#E0E4EB] bg-[#F9FAFB]/80 px-4">
        <span className="text-sm font-medium leading-[21px] text-[#C9CED8]">
          채팅 중 일정 조율이 필요하면 회의를 만들어보세요
        </span>
      </div>
      <Button className="h-12 w-40 rounded-lg bg-[#ECEBFF] text-base font-bold leading-6 text-[#837CFF] hover:bg-[#E4E2FF]">
        회의 만들기
      </Button>
    </div>
  );
}

export function MeetingInvitePage() {
  const title = participantRequest.title;

  return (
    <MeetFlowLayout title="응답 요청">
      <div className="flex h-full w-full min-w-0 bg-white">
        <div className="relative min-w-0 flex-1">
          <div className="h-full w-full overflow-y-auto px-8 pb-[132px] pt-7">
            <div className="flex w-full flex-col gap-3">
              <SystemMessage title={title} />
              <InviteMeetingCard />
            </div>
          </div>
          <InviteComposer />
        </div>
        <InviteRightPanel />
      </div>
    </MeetFlowLayout>
  );
}
