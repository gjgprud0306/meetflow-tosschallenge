import { MeetFlowLayout } from "@/components/MeetFlowLayout";

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
};

function PlaceholderMeetingCard({ card }: { card: MeetingCard }) {
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
        <span className="shrink-0 rounded-full bg-[#F0EFFF] px-3 py-1 text-xs font-bold leading-[18px] text-[#635BFF]">
          {card.status}
        </span>
      </div>
    </article>
  );
}

export function SidebarPlaceholderPage({
  cards = [],
  description,
  empty = false,
  title,
}: SidebarPlaceholderPageProps) {
  return (
    <MeetFlowLayout>
      <div className="h-full w-full overflow-y-auto px-8 pt-7">
        <div className="max-w-[760px]">
          <h1 className="text-[26px] font-bold leading-9 text-[#101828]">
            {title}
          </h1>
          <p className="mt-2 text-sm font-medium leading-[21px] text-[#667085]">
            {description}
          </p>

          {empty ? (
            <div className="mt-8 flex w-full max-w-[520px] flex-col items-center text-center">
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
    </MeetFlowLayout>
  );
}
