import { ChatMessage } from "@/components/ChatMessage";
import { MeetingCreateCard } from "@/components/MeetingCreateCard";
import { MeetFlowLayout } from "@/components/MeetFlowLayout";
import { meetingCreateIntro, meetingCreateMock, meetingCreateOptions } from "@/mocks";

export function MeetingCreatePage() {
  return (
    <MeetFlowLayout>
      <div className="h-[927px] w-full px-8 pt-7">
        <ChatMessage large message={meetingCreateIntro} />
        <div className="mt-6">
          <MeetingCreateCard
            meeting={meetingCreateMock}
            options={meetingCreateOptions}
          />
        </div>
      </div>
    </MeetFlowLayout>
  );
}
