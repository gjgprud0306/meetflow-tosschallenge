import { Check } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AvatarBadge } from "@/components/AvatarBadge";
import { MeetFlowLayout } from "@/components/MeetFlowLayout";
import { Button } from "@/components/ui/button";
import { useMeetingFlow } from "@/context/useMeetingFlow";
import { cn } from "@/lib/utils";

type ResponseStage =
  | "initial"
  | "seoResponded"
  | "junResponded"
  | "partial"
  | "reminded"
  | "minResponded"
  | "complete"
  | "confirmed";

type FollowUpMessage = {
  id: string;
  author: string;
  initial: string;
  time: string;
  message: string;
};

const responseNames = [
  { id: "owner", label: "혜경" },
  { id: "min", label: "민수" },
  { id: "jun", label: "준혁" },
  { id: "seo", label: "서연" },
  { id: "ji", label: "지수" },
  { id: "tae", label: "태민" },
];

const scheduleStorageKey = "mflow-my-schedule-cards";
const confirmedScheduleId = "confirmed-review-meeting";

function formatConfirmedTimeLabel(rawTime: string) {
  const [hourText, minuteText = "00"] = rawTime.split(":");
  const hour = Number(hourText);
  const minute = minuteText.padStart(2, "0");

  if (Number.isNaN(hour)) return rawTime;
  if (hour === 0) return `오전 12:${minute}`;
  if (hour < 12) return `오전 ${hour}:${minute}`;
  if (hour === 12) return `오후 12:${minute}`;

  return `오후 ${hour - 12}:${minute}`;
}

function getConfirmedScheduleInfo(title: string, selectedTimes: string) {
  const firstTime = selectedTimes.split(",")[0]?.trim();
  const match = firstTime?.match(/(\d{1,2})\/(\d{1,2})\s*\(([^)]+)\)\s*(\d{1,2}:\d{2})/);

  if (!match) {
    return {
      dateLabel: "7/14(화)",
      displayDateTime: "7/14(화) 오후 3:00",
      id: confirmedScheduleId,
      meta: "7/14(화) 오후 3:00 · 참석자 6명",
      timeLabel: "오후 3:00",
      title: title || "리뷰회의",
      weekday: "화",
    };
  }

  const [, month, day, weekday, time] = match;
  const timeLabel = formatConfirmedTimeLabel(time);

  return {
    dateLabel: `${month}/${day}(${weekday})`,
    displayDateTime: `${month}/${day}(${weekday}) ${timeLabel}`,
    id: confirmedScheduleId,
    meta: `${month}/${day}(${weekday}) ${timeLabel} · 참석자 6명`,
    timeLabel,
    title: title || "리뷰회의",
    weekday,
  };
}

function saveConfirmedSchedule(schedule: ReturnType<typeof getConfirmedScheduleInfo>) {
  const saved = window.localStorage.getItem(scheduleStorageKey);
  let cards: {
    category?: "회의" | "외근" | "휴가" | "개인";
    id?: string;
    meta: string;
    source?: "manual" | "confirmed";
    status: string;
    title: string;
  }[] = [];

  if (saved) {
    try {
      cards = JSON.parse(saved);
    } catch {
      cards = [];
    }
  }

  const nextCard = {
    category: "회의",
    id: schedule.id,
    meta: schedule.meta,
    source: "confirmed",
    status: "확정됨",
    title: schedule.title,
  };
  const nextCards = [
    ...cards.filter((card) => card.id !== schedule.id),
    nextCard,
  ];

  window.localStorage.setItem(scheduleStorageKey, JSON.stringify(nextCards));
}

function responseCountForStage(stage: ResponseStage) {
  if (stage === "complete" || stage === "confirmed") return 6;
  if (stage === "minResponded") return 5;
  if (stage === "partial" || stage === "reminded") return 4;
  if (stage === "junResponded") return 3;
  if (stage === "seoResponded") return 2;
  return 1;
}

function progressPercentForStage(stage: ResponseStage) {
  return `${(responseCountForStage(stage) / 6) * 100}%`;
}

function missingNamesForStage(stage: ResponseStage) {
  if (stage === "complete" || stage === "confirmed") return "";
  if (stage === "minResponded") return "태민";
  if (stage === "partial" || stage === "reminded") return "민수, 태민";
  if (stage === "junResponded") return "지수, 민수, 태민";
  if (stage === "seoResponded") return "준혁, 지수, 민수, 태민";
  return "서연, 준혁, 지수, 민수, 태민";
}

function hasResponded(stage: ResponseStage, attendeeId: string) {
  if (stage === "complete" || stage === "confirmed") return true;
  if (attendeeId === "owner") return true;
  if (attendeeId === "seo") {
    return [
      "seoResponded",
      "junResponded",
      "partial",
      "reminded",
      "minResponded",
    ].includes(stage);
  }
  if (attendeeId === "jun") {
    return ["junResponded", "partial", "reminded", "minResponded"].includes(
      stage,
    );
  }
  if (attendeeId === "ji") {
    return ["partial", "reminded", "minResponded"].includes(stage);
  }
  if (attendeeId === "min") return stage === "minResponded";

  return false;
}

function ProgressBar({ stage }: { stage: ResponseStage }) {
  const complete = stage === "complete" || stage === "confirmed";

  return (
    <div className="relative pb-[44px]">
      <div className="absolute left-0 right-0 top-3 h-1 rounded-full bg-[#E5E7EB]">
        <div
          className="h-1 rounded-full bg-[#635BFF] transition-all duration-500 ease-out"
          style={{ width: complete ? "100%" : progressPercentForStage(stage) }}
        />
      </div>
      <div className="absolute inset-x-0 top-0">
        {["회의 생성", "응답 수집", "회의 확정"].map((label, index) => {
          const done = complete ? index < 2 : index === 0;
          const active = complete ? index === 2 : index === 1;
          const position =
            index === 0
              ? "left-0 items-start text-left"
              : index === 1
                ? "left-1/2 -translate-x-1/2 items-center text-center"
                : "right-0 items-end text-right";

          return (
            <div className={cn("absolute flex w-24 flex-col", position)} key={label}>
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                  done && "bg-[#635BFF] text-white",
                  active && "bg-white text-[#635BFF] ring-4 ring-[#F7F6FF]",
                  !done && !active && "bg-[#E5E7EB] text-[#98A2B3]",
                )}
              >
                {done ? (
                  <Check className="h-4 w-4" strokeWidth={3} />
                ) : active ? (
                  <span className="h-2.5 w-2.5 rounded-full bg-[#635BFF]" />
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={cn(
                  "mt-3 whitespace-nowrap text-xs font-medium leading-[18px]",
                  done || active ? "text-[#635BFF]" : "text-[#98A2B3]",
                )}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ChatLine({
  author,
  initial,
  message,
  time,
}: {
  author: string;
  initial: string;
  message: string;
  time: string;
}) {
  const isSystem = author === "MFlow";
  const isHost = author.includes("주최자");

  return (
    <article
      className={`flex items-end ${isHost ? "justify-end" : "justify-start"}`}
    >
      {!isHost ? (
        <AvatarBadge color={isSystem ? "primary" : "muted"} initial={initial} />
      ) : null}
      <div
        className={
          isHost
            ? "mr-2 flex max-w-[700px] flex-col items-end"
            : "ml-2 flex max-w-[700px] flex-col items-start"
        }
      >
        <div
          className={`flex h-[21px] items-center gap-1.5 ${
            isHost ? "justify-end" : ""
          }`}
        >
          <span className="text-sm font-bold leading-[21px] text-[#101828]">
            {author}
          </span>
          <span className="text-xs font-normal leading-[18px] text-[#98A2B3]">
            {time}
          </span>
        </div>
        {isSystem ? (
          <div className="mt-2 inline-flex h-11 max-w-[660px] items-center rounded-2xl bg-[#F7F6FF] px-4 text-sm font-medium leading-[21px] text-[#6F6A9F]">
            {message}
          </div>
        ) : (
          <p
            className={`mt-2 max-w-[660px] rounded-2xl px-4 py-2 text-[15px] font-normal leading-6 ${
              isHost
                ? "bg-[#F7F6FF] text-right text-[#101828]"
                : "bg-[#F9FAFB] text-left text-[#1D2939]"
            }`}
          >
            {message}
          </p>
        )}
      </div>
      {isHost ? <AvatarBadge color="primary" initial={initial} /> : null}
    </article>
  );
}

function ManagementCard({
  onConfirm,
  stage,
}: {
  onConfirm: () => void;
  stage: ResponseStage;
}) {
  const { meeting, summaries } = useMeetingFlow();
  const confirmed = stage === "confirmed";
  const complete = stage === "complete" || confirmed;
  const responseCount = responseCountForStage(stage);
  const missingNames = missingNamesForStage(stage);
  const missingCount = 6 - responseCount;

  return (
    <section className="w-full max-w-[680px] overflow-hidden rounded-xl border border-[#E0E4EB] bg-white shadow-[0_4px_16px_rgba(16,24,40,0.08)]">
      <div className="flex h-[74px] items-center justify-between bg-[#F7F6FF] px-6">
        <div className="flex min-w-0 items-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#635BFF] text-xl font-bold leading-[30px] text-white">
            15
          </div>
          <div className="ml-4 min-w-0">
            <h2 className="truncate text-lg font-bold leading-7 text-[#101828]">
              {meeting.title || "리뷰회의"}
            </h2>
            <p className="text-sm font-medium leading-[21px] text-[#475467]">
              1시간 · 마감 {summaries.deadline} · {responseCount}/6명 응답
            </p>
          </div>
        </div>
        <span className="rounded-full bg-[#635BFF] px-3 py-1 text-xs font-bold leading-[18px] text-white">
          {confirmed ? "회의 확정" : complete ? "응답 완료" : "응답 수집"}
        </span>
      </div>

      <div className="grid h-[92px] grid-cols-2 border-b border-[#E0E4EB]">
        <div className="flex flex-col justify-center px-6">
          <span className="text-sm font-bold leading-[21px] text-[#98A2B3]">
            응답 현황
          </span>
          <span className="mt-1 text-[28px] font-bold leading-10 text-[#635BFF]">
            {responseCount}/6명 응답
          </span>
        </div>
        <div className="flex flex-col justify-center border-l border-[#E0E4EB] px-6">
          <span className="text-sm font-bold leading-[21px] text-[#98A2B3]">
            {complete ? "모두 응답 완료" : `미응답자 ${missingCount}명`}
          </span>
          <span className="mt-2 text-lg font-bold leading-7 text-[#101828]">
            {complete ? "-" : missingNames}
          </span>
        </div>
      </div>

      <div className="border-b border-[#E0E4EB] px-6 py-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold leading-[21px] text-[#101828]">
            응답 진행
          </h3>
          <span className="text-xs font-medium leading-[18px] text-[#98A2B3]">
            {complete ? "회의 확정 가능" : `${responseCount}명 제출 · 마감 전까지 응답 대기`}
          </span>
        </div>
        <ProgressBar stage={stage} />
      </div>

      <div className="flex items-center justify-between px-6 py-5">
        <div>
          <h3 className="text-base font-bold leading-6 text-[#101828]">
            {confirmed
              ? "회의를 확정했습니다."
              : complete
                ? "응답이 모두 모였습니다. 회의를 확정하세요."
                : "미응답자에게 마감 시간을 확인하세요"}
          </h3>
          <p className="mt-1 text-[13px] font-medium leading-5 text-[#98A2B3]">
            {confirmed
              ? "참여자에게 일정이 공유되었습니다."
              : complete
                ? "회의 확정 후 참여자에게 알림이 전송됩니다."
                : "응답이 모두 모이면 회의 확정으로 진행합니다."}
          </p>
        </div>
        <Button
          className="h-12 w-36 rounded-lg bg-[#635BFF] text-base font-bold leading-6 text-white hover:bg-[#635BFF]/90 active:bg-[#554DE8]"
          disabled={confirmed}
          onClick={complete && !confirmed ? onConfirm : undefined}
        >
          {complete ? "회의 확정" : "응답 현황 보기"}
        </Button>
      </div>
    </section>
  );
}

function StatusPanel({
  confirmedSchedule,
  onReminder,
  onViewSchedule,
  stage,
}: {
  confirmedSchedule: ReturnType<typeof getConfirmedScheduleInfo>;
  onReminder: () => void;
  onViewSchedule: () => void;
  stage: ResponseStage;
}) {
  const confirmed = stage === "confirmed";
  const complete = stage === "complete" || confirmed;
  const reminded = stage === "reminded" || stage === "minResponded";
  const responseCount = responseCountForStage(stage);
  const missingNames = missingNamesForStage(stage);
  const missingCount = 6 - responseCount;

  return (
    <aside className="flex h-[100dvh] max-h-[100dvh] w-[328px] shrink-0 flex-col overflow-hidden border-l border-[#E5E7EB] bg-[#F9FAFB]">
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-7">
        <h2 className="text-[26px] font-bold leading-9 text-[#101828]">
          응답 현황
        </h2>
        <p className="mt-2 text-sm font-medium leading-[21px] text-[#475467]">
          {confirmed
            ? "참여자에게 일정을 공유했습니다"
            : complete
              ? "모든 참여자가 응답했습니다"
              : "마감 전 응답 현황만 확인합니다"}
        </p>

        <section className="mt-6 rounded-xl border border-[#E0E4EB] bg-white p-5">
          <span className="rounded-full bg-[#F7F6FF] px-3 py-1 text-xs font-bold leading-[18px] text-[#6F6A9F]">
            {confirmed ? "회의 확정" : complete ? "응답 완료" : "응답 수집"}
          </span>
          <h3 className="mt-5 text-[30px] font-bold leading-10 text-[#635BFF]">
            {responseCount}/6명 응답
          </h3>
          <p className="mt-5 text-sm font-bold leading-[21px] text-[#475467]">
            {complete ? "회의 확정" : `미응답자 ${missingCount}명: ${missingNames}`}
          </p>
          <div className="mt-4 h-1.5 rounded-full bg-[#E5E7EB]">
            <div
              className="h-1.5 rounded-full bg-[#635BFF] transition-all duration-500 ease-out"
              style={{ width: complete ? "100%" : progressPercentForStage(stage) }}
            />
          </div>
          <p className="mt-3 text-xs font-medium leading-[18px] text-[#98A2B3]">
            {complete ? "100% 완료" : `${Math.round((responseCount / 6) * 100)}% 완료`}
          </p>

          <div className="mt-5 space-y-3">
            {responseNames.map((attendee) => {
              const done = hasResponded(stage, attendee.id);

              return (
                <div
                  className="flex items-center justify-between text-sm font-medium leading-[21px]"
                  key={attendee.id}
                >
                  <span className="text-[#475467]">{attendee.label}</span>
                  <span className={done ? "text-[#635BFF]" : "text-[#98A2B3]"}>
                    {done ? "응답 완료" : "대기 중"}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {stage === "partial" && (
          <Button
            className="mt-5 h-14 w-full rounded-lg bg-[#635BFF] text-sm font-bold leading-[21px] text-white hover:bg-[#635BFF]/90 active:bg-[#554DE8]"
            onClick={onReminder}
          >
            미응답자에게 리마인드 보내기 (2명)
          </Button>
        )}

        {reminded && (
          <div className="mt-5 rounded-lg border border-[#D8D5F7] bg-[#F7F6FF] px-5 py-4">
            <h3 className="text-sm font-bold leading-[21px] text-[#635BFF]">
              리마인드 전송됨
            </h3>
            <p className="mt-2 text-sm font-medium leading-[21px] text-[#635BFF]">
              미응답자 2명에게 리마인드를 보냈습니다. 응답을 기다리는 중입니다.
            </p>
          </div>
        )}

        {confirmed && (
          <div className="mt-5 rounded-lg border border-[#D8D5F7] bg-[#F7F6FF] px-5 py-4">
            <h3 className="text-sm font-bold leading-[21px] text-[#635BFF]">
              일정 공유 완료
            </h3>
            <p className="mt-2 text-sm font-bold leading-[21px] text-[#101828]">
              {confirmedSchedule.title}
            </p>
            <p className="mt-1 text-sm font-medium leading-[21px] text-[#635BFF]">
              {confirmedSchedule.dateLabel} · {confirmedSchedule.timeLabel}
            </p>
            <p className="mt-3 text-sm font-medium leading-[21px] text-[#635BFF]">
              모든 참여자 6명에게 확정된 일정을 공유했습니다.
            </p>
          </div>
        )}
      </div>

      {confirmed && (
        <div className="sticky bottom-0 shrink-0 border-t border-[#E5E7EB] bg-[#F9FAFB] px-6 pb-6 pt-4">
          <Button
            className="h-11 w-full rounded-lg bg-[#635BFF] text-sm font-bold leading-[21px] text-white hover:bg-[#635BFF]/90 active:bg-[#554DE8]"
            onClick={onViewSchedule}
          >
            내 일정에서 보기
          </Button>
        </div>
      )}
    </aside>
  );
}

function ReminderEntryPoint({ onReminder }: { onReminder: () => void }) {
  return (
    <section className="flex w-full max-w-[680px] items-center justify-between rounded-xl border border-[#D8D5F7] bg-[#F7F6FF] px-5 py-4">
      <p className="text-sm font-bold leading-[21px] text-[#475467]">
        민수, 태민님이 아직 응답하지 않았어요.
      </p>
      <Button
        className="h-10 rounded-lg bg-[#635BFF] px-5 text-sm font-bold leading-[21px] text-white hover:bg-[#635BFF]/90 active:bg-[#554DE8]"
        onClick={onReminder}
      >
        리마인드 보내기
      </Button>
    </section>
  );
}

function ConfirmEntryPoint({ onConfirm }: { onConfirm: () => void }) {
  return (
    <section className="flex w-full max-w-[680px] items-center justify-between rounded-xl border border-[#D8D5F7] bg-[#F7F6FF] px-5 py-4">
      <p className="text-sm font-bold leading-[21px] text-[#475467]">
        모든 응답이 모였어요. 회의를 확정해주세요.
      </p>
      <Button
        className="h-10 rounded-lg bg-[#635BFF] px-5 text-sm font-bold leading-[21px] text-white hover:bg-[#635BFF]/90 active:bg-[#554DE8]"
        onClick={onConfirm}
      >
        회의 확정
      </Button>
    </section>
  );
}

function ResponseLogList({
  onConfirm,
  messages,
  onReminder,
  showConfirm,
  showReminder,
}: {
  onConfirm: () => void;
  messages: FollowUpMessage[];
  onReminder: () => void;
  showConfirm: boolean;
  showReminder: boolean;
}) {
  if (messages.length === 0 && !showReminder && !showConfirm) return null;

  return (
    <div className="flex w-full flex-col">
      {messages.length > 0 ? (
        <div className="flex w-full flex-col gap-3">
          {messages.map((message) => (
            <ChatLine
              author={message.author}
              initial={message.initial}
              key={message.id}
              message={message.message}
              time={message.time}
            />
          ))}
        </div>
      ) : null}
      {showReminder && (
        <div className={messages.length > 0 ? "mt-6" : ""}>
          <ReminderEntryPoint onReminder={onReminder} />
        </div>
      )}
      {showConfirm && (
        <div className={messages.length > 0 ? "mt-6" : ""}>
          <ConfirmEntryPoint onConfirm={onConfirm} />
        </div>
      )}
    </div>
  );
}

function ResponseComposer() {
  return (
    <div className="absolute bottom-0 left-0 flex h-[104px] w-full items-center gap-[34px] border-t border-[#E0E4EB] bg-white px-8 py-4">
      <div className="flex h-12 min-w-0 flex-1 items-center rounded-lg border border-[#E0E4EB] bg-[#F9FAFB]/80 px-4">
        <span className="text-sm font-medium leading-[21px] text-[#C9CED8]">
          채팅 중 일정 조율이 필요하면 회의를 만들어보세요
        </span>
      </div>
      <Button className="h-12 w-40 rounded-lg bg-[#ECEBFF] text-base font-bold leading-6 text-[#837CFF] hover:bg-[#E4E2FF]">
        회의 만들기
      </Button>
    </div>
  );
}

export function ResponseStatusPage() {
  const navigate = useNavigate();
  const { meeting, summaries } = useMeetingFlow();
  const [stage, setStage] = useState<ResponseStage>("initial");
  const [reminderStarted, setReminderStarted] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const previousFollowUpCountRef = useRef(0);
  const confirmedSchedule = useMemo(
    () => getConfirmedScheduleInfo(meeting.title, summaries.selectedTimes),
    [meeting.title, summaries.selectedTimes],
  );

  useEffect(() => {
    const seoTimer = window.setTimeout(() => {
      setStage("seoResponded");
    }, 1000);
    const junTimer = window.setTimeout(() => {
      setStage("junResponded");
    }, 2000);
    const jiTimer = window.setTimeout(() => {
      setStage("partial");
    }, 3000);

    return () => {
      window.clearTimeout(seoTimer);
      window.clearTimeout(junTimer);
      window.clearTimeout(jiTimer);
    };
  }, []);

  useEffect(() => {
    if (!reminderStarted) return undefined;

    const minResponseTimer = window.setTimeout(() => {
      setStage("minResponded");
    }, 3000);
    const taeResponseTimer = window.setTimeout(() => {
      setStage("complete");
    }, 6000);

    return () => {
      window.clearTimeout(minResponseTimer);
      window.clearTimeout(taeResponseTimer);
    };
  }, [reminderStarted]);

  const followUpMessages = useMemo<FollowUpMessage[]>(() => {
    return [
      ...(stage === "seoResponded" ||
      stage === "junResponded" ||
      stage === "partial" ||
      stage === "reminded" ||
      stage === "minResponded" ||
      stage === "complete" ||
      stage === "confirmed"
        ? [
            {
              id: "seo-response",
              author: "MFlow",
              initial: "M",
              time: "오전 10:14",
              message: "서연님이 응답했습니다.",
            },
          ]
        : []),
      ...(stage === "junResponded" ||
      stage === "partial" ||
      stage === "reminded" ||
      stage === "minResponded" ||
      stage === "complete" ||
      stage === "confirmed"
        ? [
            {
              id: "jun-response",
              author: "MFlow",
              initial: "M",
              time: "오전 10:15",
              message: "준혁님이 응답했습니다.",
            },
          ]
        : []),
      ...(stage === "partial" ||
      stage === "reminded" ||
      stage === "minResponded" ||
      stage === "complete" ||
      stage === "confirmed"
        ? [
            {
              id: "ji-response",
              author: "MFlow",
              initial: "M",
              time: "오전 10:18",
              message: "지수님이 응답했습니다.",
            },
          ]
        : []),
      ...(reminderStarted
        ? [
            {
              id: "reminder",
              author: "MFlow",
              initial: "M",
              time: "오전 10:20",
              message: "미응답자에게 리마인드를 보냈습니다.",
            },
          ]
        : []),
      ...(stage === "minResponded" ||
      stage === "complete" ||
      stage === "confirmed"
        ? [
            {
              id: "min-response",
              author: "MFlow",
              initial: "M",
              time: "오전 10:21",
              message: "민수님이 응답했습니다.",
            },
          ]
        : []),
      ...(stage === "complete"
        ? [
            {
              id: "tae-response",
              author: "MFlow",
              initial: "M",
              time: "오전 10:22",
              message: "태민님이 응답했습니다.",
            },
          ]
        : []),
      ...(stage === "confirmed"
        ? [
            {
              id: "tae-response",
              author: "MFlow",
              initial: "M",
              time: "오전 10:22",
              message: "태민님이 응답했습니다.",
            },
            {
              id: "meeting-confirmed",
              author: "MFlow",
              initial: "M",
              time: "오전 10:23",
              message: "회의를 확정했습니다.",
            },
            {
              id: "schedule-shared",
              author: "MFlow",
              initial: "M",
              time: "오전 10:24",
              message: "참여자에게 일정을 공유했습니다.",
            },
            {
              id: "confirmed-schedule",
              author: "MFlow",
              initial: "M",
              time: "오전 10:25",
              message: `${confirmedSchedule.title}가 ${confirmedSchedule.displayDateTime}로 확정되었습니다.`,
            },
          ]
        : []),
    ];
  }, [confirmedSchedule, reminderStarted, stage]);

  const showReminderPrompt = stage === "partial";
  const showConfirmPrompt = stage === "complete";

  useEffect(() => {
    const previousCount = previousFollowUpCountRef.current;
    previousFollowUpCountRef.current = followUpMessages.length;

    if (
      followUpMessages.length <= previousCount &&
      !showReminderPrompt &&
      !showConfirmPrompt
    ) {
      return;
    }

    window.requestAnimationFrame(() => {
      const scrollContainer = chatScrollRef.current;

      if (!scrollContainer) return;

      scrollContainer.scrollTo({
        behavior: "smooth",
        top: scrollContainer.scrollHeight,
      });
    });
  }, [followUpMessages.length, showConfirmPrompt, showReminderPrompt]);

  function sendReminder() {
    if (reminderStarted) return;
    setStage("reminded");
    setReminderStarted(true);
  }

  function confirmMeeting() {
    if (stage !== "complete") return;
    saveConfirmedSchedule(confirmedSchedule);
    setStage("confirmed");
  }

  function viewConfirmedSchedule() {
    navigate(`/my-schedule?highlight=${confirmedSchedule.id}`);
  }

  return (
    <MeetFlowLayout title="회의 확정">
      <div className="flex h-full w-full min-w-0 bg-white">
        <div className="relative min-w-0 flex-1">
          <div
            className="h-full w-full overflow-y-auto px-8 pb-[132px] pt-7"
            ref={chatScrollRef}
          >
            <div className="flex w-full flex-col gap-3">
              <ManagementCard onConfirm={confirmMeeting} stage={stage} />
              <ResponseLogList
                onConfirm={confirmMeeting}
                messages={followUpMessages}
                onReminder={sendReminder}
                showConfirm={showConfirmPrompt}
                showReminder={showReminderPrompt}
              />
            </div>
          </div>
          <ResponseComposer />
        </div>
        <StatusPanel
          confirmedSchedule={confirmedSchedule}
          onReminder={sendReminder}
          onViewSchedule={viewConfirmedSchedule}
          stage={stage}
        />
      </div>
    </MeetFlowLayout>
  );
}
