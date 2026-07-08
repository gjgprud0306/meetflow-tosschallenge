import { useNavigate } from "react-router-dom";
import { AvatarBadge } from "@/components/AvatarBadge";
import { ChatMessage } from "@/components/ChatMessage";
import { MeetFlowLayout } from "@/components/MeetFlowLayout";
import { Button } from "@/components/ui/button";
import { useMeetingFlow } from "@/context/useMeetingFlow";
import { attendees, chatMessages } from "@/mocks";

function shortName(name: string) {
  return name.length > 2 ? name.slice(-2) : name;
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-6 text-sm font-medium leading-[21px]">
      <span className="w-[70px] shrink-0 text-[#98A2B3]">{label}</span>
      <span className="min-w-0 flex-1 text-[#475467]">{value}</span>
    </div>
  );
}

function SystemMessage({ title }: { title: string }) {
  return (
    <article className="flex items-start">
      <AvatarBadge initial="M" />
      <div className="ml-3">
        <div className="flex h-[21px] items-center gap-1.5">
          <span className="text-sm font-bold leading-[21px] text-[#101828]">
            MeetFlow
          </span>
          <span className="text-xs font-normal leading-[18px] text-[#98A2B3]">
            오전 10:30
          </span>
        </div>
        <div className="mt-2 inline-flex h-11 items-center rounded-lg bg-[#F0EFFF] px-4 text-sm font-medium leading-[21px] text-[#635BFF]">
          {title}의 응답 요청을 보냈습니다.
        </div>
      </div>
    </article>
  );
}

function RequestedMeetingCard() {
  const navigate = useNavigate();
  const { meeting, summaries } = useMeetingFlow();
  const requiredNames = attendees
    .filter((attendee) => meeting.requiredAttendeeIds.includes(attendee.id))
    .map((attendee) => shortName(attendee.name))
    .join(", ");

  return (
    <section className="w-[480px] overflow-hidden rounded-xl border border-[#E0E4EB] bg-white shadow-[0_4px_16px_rgba(16,24,40,0.08)]">
      <div className="flex h-[70px] items-center justify-between bg-[#F0EFFF] px-5">
        <h2 className="text-lg font-bold leading-7 text-[#101828]">
          {meeting.title || "회의 제목"}
        </h2>
        <span className="rounded-full bg-[#635BFF] px-3 py-1 text-xs font-bold leading-[18px] text-white">
          응답 요청
        </span>
      </div>
      <div className="space-y-4 px-5 py-5">
        <SummaryLine label="후보 기간" value={summaries.dateRange} />
        <SummaryLine label="후보 시간" value={summaries.selectedTimes} />
        <SummaryLine label="필수 참석자" value={requiredNames} />
        <SummaryLine label="응답 마감" value={summaries.deadline} />
      </div>
      <div className="border-t border-[#E0E4EB] p-5">
        <Button
          className="h-12 w-full rounded-lg bg-[#635BFF] text-base font-bold leading-6 text-white hover:bg-[#635BFF]/90 active:bg-[#554DE8]"
          onClick={() => navigate("/meetings/invite")}
        >
          응답하기
        </Button>
      </div>
    </section>
  );
}

function RequestedRightPanel() {
  const { meeting, summaries } = useMeetingFlow();

  return (
    <aside className="h-full w-[328px] shrink-0 border-l border-[#E5E7EB] bg-[#F9FAFB] px-6 pt-7">
      <h2 className="text-[26px] font-bold leading-9 text-[#101828]">
        응답 요청 전송 완료
      </h2>
      <p className="mt-2 text-sm font-medium leading-[21px] text-[#475467]">
        참여자 응답을 기다리는 중 · 마감 {summaries.deadline}
      </p>

      <section className="mt-6 rounded-xl border border-[#E0E4EB] bg-white p-5">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-bold leading-7 text-[#101828]">
            {meeting.title || "회의 제목"}
          </h3>
          <span className="rounded-full bg-[#F0EFFF] px-3 py-1 text-xs font-bold leading-[18px] text-[#635BFF]">
            수집 중
          </span>
        </div>

        <div className="mt-5 space-y-3">
          <SummaryLine label="후보 기간" value={summaries.dateRange} />
          <SummaryLine label="후보 시간" value={summaries.selectedTimes} />
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between text-sm font-bold leading-[21px]">
            <span className="text-[#475467]">응답률</span>
            <span className="text-[#635BFF]">0 / {meeting.attendeeIds.length}명</span>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-[#E5E7EB]" />
        </div>

        <div className="mt-5 space-y-3">
          {attendees
            .filter((attendee) => meeting.attendeeIds.includes(attendee.id))
            .map((attendee) => (
              <div
                className="flex items-center justify-between text-sm font-medium leading-[21px]"
                key={attendee.id}
              >
                <span className="text-[#475467]">{shortName(attendee.name)}</span>
                <span className="text-[#98A2B3]">대기 중</span>
              </div>
            ))}
        </div>
      </section>

    </aside>
  );
}

function RequestedComposer() {
  return (
    <div className="absolute bottom-0 left-0 flex h-[104px] w-full items-center gap-[34px] border-t border-[#E0E4EB] bg-white px-8 py-4">
      <div className="flex h-12 min-w-0 flex-1 items-center rounded-lg border border-[#E0E4EB] bg-[#F9FAFB]/80 px-4">
        <span className="text-sm font-medium leading-[21px] text-[#667085]">
          채팅 중 일정 조율이 필요하면 회의를 만들어보세요
        </span>
      </div>
      <Button className="h-12 w-40 rounded-lg bg-[#AAA3FF] text-base font-bold leading-6 text-white hover:bg-[#9B93FF]">
        회의 만들기
      </Button>
    </div>
  );
}

export function MeetingRequestedPage() {
  const { meeting } = useMeetingFlow();

  return (
    <MeetFlowLayout>
      <div className="flex h-full w-full min-w-0 bg-white">
        <div className="relative min-w-0 flex-1">
          <div className="h-full w-full overflow-y-auto px-8 pb-[132px] pt-7">
            <div className="flex flex-col gap-6">
              {chatMessages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              <SystemMessage title={meeting.title || "회의"} />
              <RequestedMeetingCard />
            </div>
          </div>
          <RequestedComposer />
        </div>
        <RequestedRightPanel />
      </div>
    </MeetFlowLayout>
  );
}
