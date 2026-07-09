import { MeetFlowLayout } from "@/components/MeetFlowLayout";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type MeetingCard = {
  title: string;
  meta: string;
  status: string;
};

type SidebarPlaceholderPageProps = {
  title: string;
  description: string;
  cards?: MeetingCard[];
  empty?: boolean;
  showAddSchedule?: boolean;
};

function PlaceholderMeetingCard({ card }: { card: MeetingCard }) {
  const isPastMeeting = card.status === "지난 회의";

  return (
    <article className="w-full max-w-[520px] rounded-xl border border-[#E0E4EB] bg-white px-5 py-4 shadow-[0_4px_16px_rgba(16,24,40,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold leading-7 text-[#101828]">
            {card.title}
          </h2>
          <p className="mt-1 text-sm font-medium leading-[21px] text-[#667085]">
            {card.meta}
          </p>
        </div>
        <span
          className={
            isPastMeeting
              ? "shrink-0 rounded-full bg-[#F2F4F7] px-3 py-1 text-xs font-bold leading-[18px] text-[#667085]"
              : "shrink-0 rounded-full bg-[#F7F6FF] px-3 py-1 text-xs font-bold leading-[18px] text-[#6F6A9F]"
          }
        >
          {isPastMeeting ? "완료" : card.status}
        </span>
      </div>
    </article>
  );
}

export function SidebarPlaceholderPage({
  cards = [],
  description,
  empty = false,
  showAddSchedule = false,
  title,
}: SidebarPlaceholderPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  function closeModal() {
    setIsModalOpen(false);
  }

  return (
    <MeetFlowLayout>
      <div className="h-full w-full overflow-y-auto px-8 pt-7">
        <div className={empty ? "flex min-h-full flex-col" : "max-w-[760px]"}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[26px] font-bold leading-9 text-[#101828]">
                {title}
              </h1>
              <p className="mt-2 text-sm font-medium leading-[21px] text-[#667085]">
                {description}
              </p>
            </div>
            {showAddSchedule && (
              <Button
                className="h-9 rounded-lg bg-[#635BFF] px-4 text-sm font-bold leading-[21px] text-white hover:bg-[#635BFF]/90 active:bg-[#554DE8]"
                onClick={() => setIsModalOpen(true)}
              >
                + 일정 추가
              </Button>
            )}
          </div>

          {empty ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <p className="text-sm font-bold leading-[21px] text-[#667085]">
                최근 대화가 없습니다.
              </p>
              <p className="mt-1 text-[13px] font-medium leading-5 text-[#98A2B3]">
                새로운 메시지가 등록되면 이곳에 표시됩니다.
              </p>
            </div>
          ) : (
            <div className="mt-8 flex flex-col gap-4">
              {cards.map((card) => (
                <PlaceholderMeetingCard card={card} key={card.title} />
              ))}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#101828]/30">
          <div className="w-[360px] rounded-xl border border-[#E0E4EB] bg-white p-6 shadow-[0_16px_40px_rgba(16,24,40,0.18)]">
            <h2 className="text-lg font-bold leading-7 text-[#101828]">
              일정 추가
            </h2>
            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="text-sm font-bold leading-[21px] text-[#344054]">
                  일정 제목
                </span>
                <input
                  className="mt-2 h-11 w-full rounded-lg border border-[#D0D5DD] px-3 text-sm font-medium leading-[21px] text-[#101828] outline-none focus:border-[#A8A3E8]"
                  placeholder="일정 제목"
                  type="text"
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold leading-[21px] text-[#344054]">
                  날짜
                </span>
                <input
                  className="mt-2 h-11 w-full rounded-lg border border-[#D0D5DD] px-3 text-sm font-medium leading-[21px] text-[#101828] outline-none focus:border-[#A8A3E8]"
                  type="date"
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold leading-[21px] text-[#344054]">
                  시간
                </span>
                <input
                  className="mt-2 h-11 w-full rounded-lg border border-[#D0D5DD] px-3 text-sm font-medium leading-[21px] text-[#101828] outline-none focus:border-[#A8A3E8]"
                  type="time"
                />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                className="h-10 rounded-lg border border-[#D0D5DD] bg-white px-4 text-sm font-bold leading-[21px] text-[#475467] hover:bg-[#F9FAFB]"
                onClick={closeModal}
              >
                취소
              </Button>
              <Button
                className="h-10 rounded-lg bg-[#635BFF] px-4 text-sm font-bold leading-[21px] text-white hover:bg-[#635BFF]/90 active:bg-[#554DE8]"
                onClick={closeModal}
              >
                저장
              </Button>
            </div>
          </div>
        </div>
      )}
    </MeetFlowLayout>
  );
}
