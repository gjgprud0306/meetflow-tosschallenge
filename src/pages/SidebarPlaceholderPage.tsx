import { ChatMessage } from "@/components/ChatMessage";
import { MeetFlowLayout } from "@/components/MeetFlowLayout";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { ChatMessage as ChatMessageType } from "@/types/meeting";

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
  messages?: ChatMessageType[];
  showAddSchedule?: boolean;
};

const scheduleStorageKey = "mflow-my-schedule-cards";
const scheduleTimeOptions = Array.from({ length: 12 }, (_, index) => {
  const hour = index + 9;

  return `${hour.toString().padStart(2, "0")}:00`;
});

function formatScheduleDate(dateValue: string) {
  const [year, month, day] = dateValue.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const weekday = ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];

  return `${month}/${day} (${weekday})`;
}

function getInitialScheduleCards(cards: MeetingCard[], showAddSchedule: boolean) {
  if (!showAddSchedule) return cards;

  const saved = window.localStorage.getItem(scheduleStorageKey);

  if (!saved) return cards;

  try {
    return JSON.parse(saved) as MeetingCard[];
  } catch {
    return cards;
  }
}

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
  messages = [],
  showAddSchedule = false,
  title,
}: SidebarPlaceholderPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scheduleCards, setScheduleCards] = useState<MeetingCard[]>(() =>
    getInitialScheduleCards(cards, showAddSchedule),
  );
  const [scheduleTitle, setScheduleTitle] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const canSaveSchedule =
    scheduleTitle.trim().length > 0 &&
    selectedDate.trim().length > 0 &&
    selectedTime.trim().length > 0;

  function closeModal() {
    setIsModalOpen(false);
    setScheduleTitle("");
    setSelectedDate("");
    setSelectedTime("");
  }

  function saveSchedule() {
    if (!canSaveSchedule) return;

    const newSchedule = {
      meta: `${formatScheduleDate(selectedDate)} ${selectedTime} · 내 일정`,
      status: "예정",
      title: scheduleTitle.trim(),
    };
    const nextCards = [...scheduleCards, newSchedule];

    setScheduleCards(nextCards);
    window.localStorage.setItem(scheduleStorageKey, JSON.stringify(nextCards));
    closeModal();
  }

  return (
    <MeetFlowLayout title={title}>
      <div className="h-full w-full overflow-y-auto px-8 pt-7">
        <div
          className={
            empty ? "flex min-h-full flex-col" : "w-full"
          }
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium leading-[21px] text-[#667085]">
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

          {messages.length > 0 ? (
            <div className="mt-8 flex flex-col gap-2.5">
              {messages.map((message, index) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  previousAuthor={messages[index - 1]?.author}
                />
              ))}
            </div>
          ) : empty ? (
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
              {scheduleCards.map((card) => (
                <PlaceholderMeetingCard
                  card={card}
                  key={`${card.title}-${card.meta}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#101828]/30 p-6">
          <div className="flex max-h-[calc(100vh-48px)] w-[360px] flex-col overflow-hidden rounded-xl border border-[#E0E4EB] bg-white shadow-[0_16px_40px_rgba(16,24,40,0.18)]">
            <div className="px-6 pt-6">
              <h2 className="text-lg font-bold leading-7 text-[#101828]">
                일정 추가
              </h2>
            </div>
            <div className="mt-5 min-h-0 flex-1 space-y-4 overflow-y-auto px-6">
              <label className="block">
                <span className="text-sm font-bold leading-[21px] text-[#344054]">
                  일정 제목
                </span>
                <input
                  className="mt-2 h-11 w-full rounded-lg border border-[#D0D5DD] px-3 text-sm font-medium leading-[21px] text-[#101828] outline-none focus:border-[#635BFF]"
                  onChange={(event) => setScheduleTitle(event.target.value)}
                  placeholder="일정 제목"
                  type="text"
                  value={scheduleTitle}
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold leading-[21px] text-[#344054]">
                  날짜
                </span>
                <input
                  className="mt-2 h-11 w-full rounded-lg border border-[#D0D5DD] px-3 text-sm font-medium leading-[21px] text-[#101828] outline-none focus:border-[#635BFF]"
                  onChange={(event) => setSelectedDate(event.target.value)}
                  type="date"
                  value={selectedDate}
                />
              </label>
              <div>
                <span className="text-sm font-bold leading-[21px] text-[#344054]">
                  시간
                </span>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {scheduleTimeOptions.map((time) => {
                    const selected = selectedTime === time;

                    return (
                      <button
                        className={`h-10 rounded-lg border text-sm font-medium leading-[21px] ${
                          selected
                            ? "border-[#837CFF] bg-[#F7F6FF] text-[#837CFF]"
                            : "border-[#D0D5DD] bg-white text-[#475467] hover:bg-[#F9FAFB]"
                        }`}
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        type="button"
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="mt-6 flex shrink-0 justify-end gap-2 border-t border-[#E0E4EB] bg-white px-6 py-4">
              <Button
                className="h-10 rounded-lg border border-[#D0D5DD] bg-white px-4 text-sm font-bold leading-[21px] text-[#475467] hover:bg-[#F9FAFB]"
                onClick={closeModal}
              >
                취소
              </Button>
              <Button
                className="h-10 rounded-lg bg-[#635BFF] px-4 text-sm font-bold leading-[21px] text-white hover:bg-[#635BFF]/90 active:bg-[#554DE8] disabled:bg-[#C9CED8] disabled:text-white"
                disabled={!canSaveSchedule}
                onClick={saveSchedule}
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
