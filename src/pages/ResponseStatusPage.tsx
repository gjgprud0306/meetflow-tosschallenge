import { ChatMessage } from "@/components/ChatMessage";
import { MeetFlowLayout } from "@/components/MeetFlowLayout";
import { useMeetingFlow } from "@/context/useMeetingFlow";
import { attendees, meetingCreateIntro } from "@/mocks";

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between border-b border-[#EEF2F6] py-3 last:border-b-0">
      <span className="text-[13px] font-bold leading-5 text-[#667085]">
        {label}
      </span>
      <span className="max-w-[520px] text-right text-sm font-medium leading-[21px] text-[#101828]">
        {value}
      </span>
    </div>
  );
}

export function ResponseStatusPage() {
  const { meeting, summaries } = useMeetingFlow();
  const attendeeNames = attendees
    .filter((attendee) => meeting.attendeeIds.includes(attendee.id))
    .map((attendee) => attendee.name)
    .join(", ");
  const requiredNames = attendees
    .filter((attendee) => meeting.requiredAttendeeIds.includes(attendee.id))
    .map((attendee) => attendee.name)
    .join(", ");

  return (
    <MeetFlowLayout>
      <div className="h-[927px] w-full px-8 pt-7">
        <ChatMessage large message={meetingCreateIntro} />
        <div className="mt-6 w-[880px] rounded-xl border border-[#E0E4EB] bg-white px-7 py-6">
          <h2 className="text-xl font-bold leading-[30px] text-[#101828]">
            응답 요청을 보냈습니다
          </h2>
          <p className="mt-1 text-[13px] font-medium leading-5 text-[#475467]">
            참여자에게 가능한 시간 응답 요청이 전송되었습니다.
          </p>
          <div className="mt-5 rounded-lg border border-[#E0E4EB] bg-[#F9FAFB] px-5 py-2">
            <SummaryRow label="회의 제목" value={meeting.title} />
            <SummaryRow label="참석자" value={attendeeNames} />
            <SummaryRow label="필수 참석자" value={requiredNames} />
            <SummaryRow label="후보 기간" value={summaries.dateRange} />
            <SummaryRow label="후보 시간" value={summaries.selectedTimes} />
            <SummaryRow label="응답 마감" value={summaries.deadline} />
            <SummaryRow label="리마인드" value={summaries.reminderText} />
          </div>
        </div>
      </div>
    </MeetFlowLayout>
  );
}
