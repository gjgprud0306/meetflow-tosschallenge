import { AvatarBadge } from "@/components/AvatarBadge";

const headerAvatars = [
  { initial: "혜", color: "primary" as const },
  { initial: "민", color: "muted" as const },
  { initial: "준", color: "secondary" as const },
  { initial: "서", color: "muted" as const },
];

type ChatHeaderProps = {
  showMeta?: boolean;
  title: string;
};

export function ChatHeader({ showMeta = true, title }: ChatHeaderProps) {
  return (
    <header className="flex h-24 w-full shrink-0 items-center border-b border-[#E5E7EB] bg-white px-8 py-[22px]">
      <div className="min-w-0 flex-1">
        <h1 className="text-[23px] font-bold leading-[35px] text-[#101828]">
          {title}
        </h1>
        {showMeta ? (
          <div className="mt-1.5 flex items-center gap-2">
            <span className="rounded-full bg-[#F3F4F6] px-2 py-1 text-xs font-bold leading-[18px] text-[#475467]">
              참여자 6명
            </span>
            <span className="rounded-full bg-[#F7F6FF] px-2 py-1 text-xs font-bold leading-[18px] text-[#6F6A9F]">
              진행 중
            </span>
          </div>
        ) : null}
      </div>
      <div className="flex h-10 w-[260px] shrink-0 items-center gap-2">
        {headerAvatars.map((avatar) => (
          <AvatarBadge
            color={avatar.color}
            initial={avatar.initial}
            key={avatar.initial}
          />
        ))}
        <span className="ml-1 text-[13px] font-bold leading-5 text-[#475467]">
          +2
        </span>
      </div>
    </header>
  );
}
