import { ChatHeader } from "@/components/ChatHeader";
import { Sidebar } from "@/components/Sidebar";
import type { ReactNode } from "react";

type MeetFlowLayoutProps = {
  children: ReactNode;
  bottomBar?: ReactNode;
};

export function MeetFlowLayout({ children, bottomBar }: MeetFlowLayoutProps) {
  return (
    <main className="h-[1024px] w-[1440px] overflow-hidden bg-[#F9FAFB]">
      <div className="flex h-full w-full">
        <Sidebar />
        <section className="flex h-[1024px] w-[1168px] flex-col overflow-hidden bg-white">
          <ChatHeader />
          <div className="relative flex-1 bg-white">{children}</div>
          {bottomBar}
        </section>
      </div>
    </main>
  );
}
