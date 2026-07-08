import { AvatarBadge } from "@/components/AvatarBadge";
import { cn } from "@/lib/utils";

const meetingItems = ["진행 중", "확정됨", "지난 회의"];
const channelItems = ["공지", "디자인팀", "개발팀", "PM"];

function Dot({ active = false, large = false }: { active?: boolean; large?: boolean }) {
  return (
    <span
      className={cn(
        "rounded-full",
        large ? "h-2 w-2" : "h-1.5 w-1.5",
        active ? "bg-[#635BFF]" : "bg-[#98A7BA]",
      )}
    />
  );
}

export function Sidebar() {
  return (
    <aside className="relative h-full w-[272px] shrink-0 border border-[#E5E7EB] bg-white">
      <div className="flex h-full flex-col px-6 pb-6 pt-7">
        <div className="flex h-9 w-[184px] items-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#635BFF] text-xl font-extrabold leading-none text-white">
            M
          </div>
          <div className="ml-2.5 text-lg font-bold leading-[22px] text-[#101828]">
            MeetFlow
          </div>
        </div>

        <nav className="mt-7 h-[216px] w-56">
          <div className="flex h-10 items-center pl-3 text-sm font-normal leading-[21px] text-[#475467]">
            <Dot large />
            <span className="ml-2.5">내 일정</span>
          </div>
          <div className="mt-4 text-xs font-medium leading-[18px] text-[#667085]">
            회의
          </div>
          <div className="mt-2 space-y-1">
            {meetingItems.map((item) => {
              const active = item === "진행 중";
              return (
                <div
                  className={cn(
                    "flex h-10 w-56 items-center rounded-lg pl-[22px] text-sm leading-[21px] text-[#475467]",
                    active ? "bg-[#F0EFFF] font-medium" : "font-normal",
                  )}
                  key={item}
                >
                  <Dot active={active} />
                  <span className="ml-2.5">{item}</span>
                </div>
              );
            })}
          </div>
        </nav>

        <section className="mt-7 h-[198px] w-56">
          <div className="text-xs font-bold leading-[18px] text-[#667085]">
            채널
          </div>
          <div className="mt-2 space-y-2">
            {channelItems.map((item) => {
              const active = item === "디자인팀";
              return (
                <div
                  className={cn(
                    "flex h-10 w-56 items-center rounded-lg pl-3 text-sm leading-[21px]",
                    active
                      ? "bg-[#F2F5FF] font-bold text-[#635BFF]"
                      : "font-medium text-[#4F596D]",
                  )}
                  key={item}
                >
                  <span className="w-2.5 text-[15px] leading-[23px]">#</span>
                  <span className="ml-2.5">{item}</span>
                </div>
              );
            })}
          </div>
        </section>

        <div className="mt-auto border-t border-[#E5EAF0] pt-4">
          <div className="flex h-14 items-center">
            <AvatarBadge initial="혜" />
            <div className="ml-3">
              <div className="text-sm font-bold leading-[21px] text-[#4F596D]">
                허혜경
              </div>
              <div className="text-[13px] font-normal leading-[18px] text-[#808CA1]">
                Product Designer
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
