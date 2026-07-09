import { Link } from "react-router-dom";
import { ChatMessage } from "@/components/ChatMessage";
import { MeetFlowLayout } from "@/components/MeetFlowLayout";
import { Button } from "@/components/ui/button";
import { chatMessages } from "@/mocks";

function ChatComposer() {
  return (
    <div className="flex h-[104px] w-full shrink-0 items-center gap-[34px] bg-white pl-0 pr-8 py-4">
      <div className="flex h-12 min-w-0 flex-1 items-center rounded-lg border border-[#E0E4EB] bg-[#F9FAFB]/80 px-4">
        <span className="text-sm font-medium leading-[21px] text-[#667085]">
          채팅 중 일정 조율이 필요하면 회의를 만들어보세요
        </span>
      </div>
      <Link className="shrink-0" to="/meetings/new">
        <Button className="h-12 w-[284px] rounded-lg bg-[#635BFF] text-lg font-bold leading-[21px] text-white hover:bg-[#635BFF]/90">
          회의 만들기
        </Button>
      </Link>
    </div>
  );
}

export function HomePage() {
  return (
    <MeetFlowLayout bottomBar={<ChatComposer />}>
      <div className="h-full w-full overflow-y-auto pl-0 pr-8 pt-7">
        <div className="flex flex-col gap-6">
          {chatMessages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </div>
      </div>
    </MeetFlowLayout>
  );
}
