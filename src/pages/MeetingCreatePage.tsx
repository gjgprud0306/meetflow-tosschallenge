import { ChatMessage } from "@/components/ChatMessage";
import { MeetingCreateCard } from "@/components/MeetingCreateCard";
import { MeetFlowLayout } from "@/components/MeetFlowLayout";
import { meetingCreateIntro, meetingCreateOptions } from "@/mocks";

export function MeetingCreatePage() {
  return (
    <MeetFlowLayout>
      <div className="h-full w-full overflow-y-auto px-8 pb-8 pt-7">
        <div className="mx-auto flex w-full max-w-[960px] flex-col gap-4">
          <ChatMessage large message={meetingCreateIntro} />
          <MeetingCreateCard options={meetingCreateOptions} />
        </div>
      </div>
    </MeetFlowLayout>
  );
}
