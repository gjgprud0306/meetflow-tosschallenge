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
            MFlow
          </span>
          <span className="text-xs font-normal leading-[18px] text-[#98A2B3]">
            오전 10:30
          </span>
        </div>
        <div className="mt-2 inline-flex h-11 items-center rounded-lg bg-[#F7F6FF] px-4 text-sm font-medium leading-[21px] text-[#6F6A9F]">
          {title}의 응답 요청을 보냈습니다.
        </div>
      </div>
    </article>
  );
}

function RequestedMeetingCard() {
  const navigate = useNavigate();
  const { meeting, summaries } = useMeetingFlow();
  const requiredAttendees = attendees.filter((attendee) =>
    meeting.requiredAttendeeIds.includes(attendee.id),
  );
  const optionalAttendees = attendees.filter(
    (attendee) =>
      meeting.attendeeIds.includes(attendee.id) &&
      !meeting.requiredAttendeeIds.includes(attendee.id),
  );
  const requiredNames = requiredAttendees
    .map((attendee) => shortName(attendee.name))
    .join(", ");
  const optionalNames = optionalAttendees
    .map((attendee) => shortName(attendee.name))
    .join(", ");

  return (
    <section className="w-[520px] overflow-hidden rounded-xl border border-[#E0E4EB] bg-white shadow-[0_4px_16px_rgba(16,24,40,0.08)]">
      <div className="flex h-[70px] items-center justify-between bg-[#F7F6FF] px-5">
        <h2 className="text-lg font-bold leading-7 text-[#101828]">
          {meeting.title || "회의 제목"}
        </h2>
        <span className="rounded-full bg-[#635BFF] px-3 py-1 text-xs font-bold leading-[18px] text-white">
          필수 응답 요청
        </span>
      </div>
      <div className="space-y-4 px-5 py-5">
        <SummaryLine label="후보 기간" value={summaries.dateRange} />
        <SummaryLine label="후보 시간" value={summaries.selectedTimes} />
        <SummaryLine label="필수 참석" value={requiredNames} />
        <SummaryLine label="선택 참석" value={optionalNames || "필수 응답 완료 후 발송"} />
        <SummaryLine label="응답 마감" value={summaries.deadline} />
      </div>
      <div className="border-t border-[#E0E4EB] px-5 py-4">
        <p className="mb-4 text-sm font-medium leading-[21px] text-[#667085]">
          필수 참석자 3명에게 먼저 일정 응답 요청을 보냈습니다.
          필수 참석자가 모두 응답하면 선택 참석자에게 후보 일정을 보낼 수 있습니다.
        </p>
        <Button
          className="h-12 w-full rounded-lg bg-[#635BFF] text-base font-bold leading-6 text-white hover:bg-[#635BFF]/90 active:bg-[#554DE8]"
          onClick={() => navigate("/meetings/response-status")}
        >
          응답 현황 보기
        </Button>
      </div>
    </section>
  );
}

function RequestedRightPanel() {
  const { meeting, summaries } = useMeetingFlow();
  const requiredAttendees = attendees.filter((attendee) =>
    meeting.requiredAttendeeIds.includes(attendee.id),
  );
  const optionalAttendees = attendees.filter(
    (attendee) =>
      meeting.attendeeIds.includes(attendee.id) &&
      !meeting.requiredAttendeeIds.includes(attendee.id),
  );

  return (
    <aside className="h-full w-[328px] shrink-0 border-l border-[#E5E7EB] bg-[#F9FAFB] px-6 pt-7">
      <h2 className="text-[26px] font-bold leading-9 text-[#101828]">
        응답 요청 전송 완료
      </h2>
      <p className="mt-2 text-sm font-medium leading-[21px] text-[#475467]">
        필수 참석자 응답 대기 중 · 마감 {summaries.deadline}
      </p>

      <section className="mt-6 rounded-xl border border-[#E0E4EB] bg-white p-5">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-bold leading-7 text-[#101828]">
            {meeting.title || "회의 제목"}
          </h3>
          <span className="rounded-full bg-[#F7F6FF] px-3 py-1 text-xs font-bold leading-[18px] text-[#6F6A9F]">
            필수 수집 중
          </span>
        </div>

        <div className="mt-5 space-y-3">
          <SummaryLine label="후보 기간" value={summaries.dateRange} />
          <SummaryLine label="후보 시간" value={summaries.selectedTimes} />
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between text-sm font-bold leading-[21px]">
            <span className="text-[#475467]">필수 응답률</span>
            <span className="text-[#635BFF]">0 / {requiredAttendees.length}명</span>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-[#E5E7EB]" />
        </div>

        <div className="mt-5 space-y-3">
          {requiredAttendees.map((attendee) => (
            <div
              className="flex items-center justify-between text-sm font-medium leading-[21px]"
              key={attendee.id}
            >
              <span className="flex items-center gap-2 text-[#475467]">
                {shortName(attendee.name)}
                <span className="rounded-full bg-[#F0EEFF] px-2 py-[2px] text-[11px] font-bold leading-[16px] text-[#635BFF]">
                  필수
                </span>
              </span>
              <span className="text-[#98A2B3]">대기 중</span>
            </div>
          ))}
        </div>

        <div className="mt-5 border-t border-[#E0E4EB] pt-4">
          <p className="text-xs font-bold leading-[18px] text-[#98A2B3]">
            선택 참석자는 필수 참석자 응답 완료 후 발송
          </p>
          <div className="mt-3 space-y-2">
            {optionalAttendees.map((attendee) => (
              <div
                className="flex items-center justify-between text-sm font-medium leading-[21px]"
                key={attendee.id}
              >
                <span className="text-[#667085]">{shortName(attendee.name)}</span>
                <span className="rounded-full bg-[#F3F4F6] px-2 py-[2px] text-[11px] font-bold leading-[16px] text-[#667085]">
                  선택
                </span>
              </div>
            ))}
          </div>
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
      <Button className="h-12 w-40 rounded-lg bg-[#ECEBFF] text-base font-bold leading-6 text-[#837CFF] hover:bg-[#E4E2FF]">
        회의 만들기
      </Button>
    </div>
  );
}

export function MeetingRequestedPage() {
  const hostMessage = chatMessages[chatMessages.length - 1];

  return (
    <MeetFlowLayout title="응답 요청">
      <div className="flex h-full w-full min-w-0 bg-white">
        <div className="relative min-w-0 flex-1">
          <div className="h-full w-full overflow-y-auto px-8 pb-[132px] pt-7">
            <div className="flex w-full flex-col gap-3">
              {hostMessage && (
                <ChatMessage key={hostMessage.id} message={hostMessage} />
              )}
              <SystemMessage title="디자인" />
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
