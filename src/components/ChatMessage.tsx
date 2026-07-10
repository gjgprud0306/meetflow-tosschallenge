import { AvatarBadge } from "@/components/AvatarBadge";
import type { ChatMessage as ChatMessageType } from "@/types/meeting";

type ChatMessageProps = {
  message: ChatMessageType;
  large?: boolean;
};

export function ChatMessage({ message, large = false }: ChatMessageProps) {
  const isHost = message.author.includes("주최자");

  return (
    <article className={`flex items-start ${isHost ? "justify-end" : ""}`}>
      {!isHost ? <AvatarBadge color={message.color} initial={message.initial} /> : null}
      <div
        className={`min-w-0 ${isHost ? "mr-3 flex max-w-[680px] flex-col items-end" : "ml-3 flex-1"}`}
      >
        <div
          className={`flex h-[21px] items-center gap-1.5 ${
            isHost ? "justify-end" : ""
          }`}
        >
          <span className="text-sm font-bold leading-[21px] text-[#101828]">
            {message.author}
          </span>
          <span className="text-xs font-normal leading-[18px] text-[#98A2B3]">
            {message.time}
          </span>
        </div>
        <div
          className={`mt-2 flex flex-col gap-1 text-base font-normal leading-6 ${
            isHost ? "items-end text-right" : "items-start text-left"
          }`}
        >
          {message.message.map((line) => (
            <p
              className={
                isHost
                  ? "max-w-[680px] rounded-lg bg-[#F7F6FF] px-4 py-2 text-[#101828]"
                  : large
                    ? "max-w-[680px] rounded-lg bg-[#F9FAFB] px-4 py-2 text-[#1D2939]"
                    : "max-w-[680px] rounded-lg bg-[#F9FAFB] px-4 py-2 text-[#1D2939]"
              }
              key={line}
            >
              {line}
            </p>
          ))}
        </div>
      </div>
      {isHost ? <AvatarBadge color={message.color} initial={message.initial} /> : null}
    </article>
  );
}
