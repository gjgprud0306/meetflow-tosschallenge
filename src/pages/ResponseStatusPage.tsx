import { ChatMessage } from "@/components/ChatMessage";
import { MeetFlowLayout } from "@/components/MeetFlowLayout";
import { meetingCreateIntro } from "@/mocks";

export function ResponseStatusPage() {
  return (
    <MeetFlowLayout>
      <div className="h-[927px] w-full px-8 pt-7">
        <ChatMessage large message={meetingCreateIntro} />
        <div className="mt-6 flex h-[180px] w-[880px] flex-col justify-center rounded-xl border border-[#E0E4EB] bg-white px-7">
          <h2 className="text-xl font-bold leading-[30px] text-[#101828]">
            응답 요청을 보냈습니다
          </h2>
          <p className="mt-1 text-[13px] font-medium leading-5 text-[#475467]">
            참여자에게 가능한 시간 응답 요청이 전송되었습니다.
          </p>
        </div>
      </div>
    </MeetFlowLayout>
  );
}
