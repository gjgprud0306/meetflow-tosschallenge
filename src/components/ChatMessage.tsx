import { AvatarBadge } from "@/components/AvatarBadge";
import type { ChatMessage as ChatMessageType } from "@/types/meeting";

type ChatMessageProps = {
  message: ChatMessageType;
  large?: boolean;
};

export function ChatMessage({ message, large = false }: ChatMessageProps) {
  return (
    <article className="flex items-start">
      <AvatarBadge color={message.color} initial={message.initial} />
      <div className="ml-3 min-w-0 flex-1">
        <div className="flex h-[21px] items-center gap-1.5">
          <span className="text-sm font-bold leading-[21px] text-[#101828]">
            {message.author}
          </span>
          <span className="text-xs font-normal leading-[18px] text-[#98A2B3]">
            {message.time}
          </span>
        </div>
        <div className="mt-1 text-base font-normal leading-6 text-[#1D2939]">
          {message.message.map((line) => (
            <p className={large ? "max-w-[680px]" : "max-w-[680px]"} key={line}>
              {line}
            </p>
          ))}
        </div>
      </div>
    </article>
  );
}
