import { ChatHeader } from "@/components/ChatHeader";
import { Sidebar } from "@/components/Sidebar";
import type { ReactNode } from "react";

type MeetFlowLayoutProps = {
  children: ReactNode;
  bottomBar?: ReactNode;
  showHeaderMeta?: boolean;
  title: string;
};

export function MeetFlowLayout({
  children,
  bottomBar,
  showHeaderMeta = true,
  title,
}: MeetFlowLayoutProps) {
  return (
    <main className="h-screen max-h-[1024px] min-h-[720px] w-full overflow-hidden bg-[#F9FAFB]">
      <div className="flex h-full w-full">
        <Sidebar />
        <section className="flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-white">
          <ChatHeader showMeta={showHeaderMeta} title={title} />
          <div className="relative min-h-0 flex-1 bg-white">{children}</div>
          {bottomBar}
        </section>
      </div>
    </main>
  );
}
