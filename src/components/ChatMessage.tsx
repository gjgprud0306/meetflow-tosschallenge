import { AvatarBadge } from "@/components/AvatarBadge";
import type { ChatMessage as ChatMessageType } from "@/types/meeting";

type ChatMessageProps = {
  message: ChatMessageType;
  large?: boolean;
  previousAuthor?: string;
};

export function ChatMessage({
  message,
  large = false,
  previousAuthor,
}: ChatMessageProps) {
  const isHost = message.author.includes("주최자");
  const isCompact = previousAuthor === message.author;
  const bubbleMaxWidth = large ? "max-w-[700px]" : "max-w-[660px]";

  return (
    <article
      className={`flex items-end px-[clamp(20px,4vw,56px)] ${isHost ? "justify-end" : "justify-start"}`}
    >
      {!isHost ? (
        isCompact ? (
          <div className="h-10 w-10 shrink-0" />
        ) : (
          <AvatarBadge color={message.color} initial={message.initial} />
        )
      ) : null}
      <div
        className={`min-w-0 ${
          isHost
            ? "mr-2 flex max-w-[700px] flex-col items-end"
            : "ml-2 flex max-w-[700px] flex-col items-start"
        }`}
      >
        {!isCompact ? (
          <div
            className={`flex h-[21px] items-center gap-1.5 ${
              isHost ? "justify-end" : "justify-start"
            }`}
          >
            <span className="text-sm font-bold leading-[21px] text-[#101828]">
              {message.author}
            </span>
            <span className="text-xs font-normal leading-[18px] text-[#98A2B3]">
              {message.time}
            </span>
          </div>
        ) : null}
        <div
          className={`flex flex-col gap-1 text-[15px] font-normal leading-6 ${
            isCompact ? "mt-1" : "mt-2"
          } ${
            isHost ? "items-end text-right" : "items-start text-left"
          }`}
        >
          {message.message.map((line) => (
            <p
              className={
                isHost
                  ? `${bubbleMaxWidth} rounded-2xl bg-[#F7F6FF] px-4 py-2 text-[#101828]`
                  : large
                    ? `${bubbleMaxWidth} rounded-2xl bg-[#F9FAFB] px-4 py-2 text-[#1D2939]`
                    : `${bubbleMaxWidth} rounded-2xl bg-[#F9FAFB] px-4 py-2 text-[#1D2939]`
              }
              key={line}
            >
              {line}
            </p>
          ))}
        </div>
      </div>
      {isHost ? (
        isCompact ? (
          <div className="h-10 w-10 shrink-0" />
        ) : (
          <AvatarBadge color={message.color} initial={message.initial} />
        )
      ) : null}
    </article>
  );
}
