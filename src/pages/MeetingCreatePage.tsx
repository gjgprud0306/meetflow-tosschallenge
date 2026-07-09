import { ChatMessage } from "@/components/ChatMessage";
import { MeetingCreateCard } from "@/components/MeetingCreateCard";
import { MeetFlowLayout } from "@/components/MeetFlowLayout";
import { meetingCreateIntro, meetingCreateOptions } from "@/mocks";

export function MeetingCreatePage() {
  return (
    <MeetFlowLayout>
      <div className="h-full w-full overflow-y-auto px-8 pb-8 pt-7">
        <ChatMessage large message={meetingCreateIntro} />
        <div className="mt-6">
          <MeetingCreateCard options={meetingCreateOptions} />
        </div>
      </div>
    </MeetFlowLayout>
  );
}
