import { Check } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AvatarBadge } from "@/components/AvatarBadge";
import { MeetFlowLayout } from "@/components/MeetFlowLayout";
import { Button } from "@/components/ui/button";
import { useMeetingFlow } from "@/context/useMeetingFlow";
import { attendees } from "@/mocks";
import { cn } from "@/lib/utils";

type ResponseStage =
  | "requiredCollecting"
  | "requiredOne"
  | "requiredTwo"
  | "requiredComplete"
  | "optionalSent"
  | "optionalOne"
  | "optionalTwo"
  | "allComplete"
  | "confirmed";

type FollowUpMessage = {
  id: string;
  author: string;
  initial: string;
  time: string;
  message: string;
};

type ResponseStatus = "가능" | "불가능" | "미응답" | "요청 전";

const scheduleStorageKey = "mflow-my-schedule-cards";
const confirmedScheduleId = "confirmed-review-meeting";

const candidateSlots = [
  {
    id: "slot-7-15-15",
    label: "7월 15일 수요일 15:00–16:00",
    availableIds: ["owner", "min", "jun", "seo", "ji", "eun"],
    unavailableIds: [],
  },
  {
    id: "slot-7-16-10",
    label: "7월 16일 목요일 10:00–11:00",
    availableIds: ["owner", "min", "jun", "seo", "ji", "eun"],
    unavailableIds: [],
  },
  {
    id: "slot-7-17-14",
    label: "7월 17일 금요일 14:00–15:00",
    availableIds: ["owner", "min", "jun", "seo", "ji", "eun"],
    unavailableIds: [],
  },
  {
    id: "slot-7-14-14",
    label: "7월 14일 화요일 14:00–15:00",
    availableIds: ["owner", "min", "jun", "eun"],
    unavailableIds: ["seo", "ji"],
  },
  {
    id: "slot-7-13-11",
    label: "7월 13일 월요일 11:00–12:00",
    availableIds: ["owner", "min", "jun"],
    unavailableIds: ["seo", "ji", "eun"],
  },
];

function attendeeById(id: string) {
  return attendees.find((attendee) => attendee.id === id);
}

function shortName(name: string) {
  return name.length > 2 ? name.slice(-2) : name;
}

function roleBadge(required: boolean) {
  return required ? "필수 참석자" : "선택 참석자";
}

function getRespondedIds(
  stage: ResponseStage,
  requiredIds: string[],
  optionalIds: string[],
) {
  const ids: string[] = [];

  if (
    [
      "requiredOne",
      "requiredTwo",
      "requiredComplete",
      "optionalSent",
      "optionalOne",
      "optionalTwo",
      "allComplete",
      "confirmed",
    ].includes(stage) &&
    requiredIds[0]
  ) {
    ids.push(requiredIds[0]);
  }
  if (
    [
      "requiredTwo",
      "requiredComplete",
      "optionalSent",
      "optionalOne",
      "optionalTwo",
      "allComplete",
      "confirmed",
    ].includes(stage) &&
    requiredIds[1]
  ) {
    ids.push(requiredIds[1]);
  }
  if (
    [
      "requiredComplete",
      "optionalSent",
      "optionalOne",
      "optionalTwo",
      "allComplete",
      "confirmed",
    ].includes(stage) &&
    requiredIds[2]
  ) {
    ids.push(requiredIds[2]);
  }
  if (["optionalOne", "optionalTwo", "allComplete", "confirmed"].includes(stage)) {
    if (optionalIds[0]) ids.push(optionalIds[0]);
  }
  if (["optionalTwo", "allComplete", "confirmed"].includes(stage)) {
    if (optionalIds[1]) ids.push(optionalIds[1]);
  }
  if (["allComplete", "confirmed"].includes(stage)) {
    if (optionalIds[2]) ids.push(optionalIds[2]);
  }

  return ids;
}

function getCounts(
  stage: ResponseStage,
  requiredIds: string[],
  optionalIds: string[],
) {
  const respondedIds = getRespondedIds(stage, requiredIds, optionalIds);
  const requiredCount = requiredIds.filter((id) => respondedIds.includes(id)).length;
  const optionalCount = optionalIds.filter((id) => respondedIds.includes(id)).length;

  return {
    optionalCount,
    requiredCount,
    respondedIds,
    totalCount: requiredCount + optionalCount,
  };
}

function progressPercent(
  stage: ResponseStage,
  requiredIds: string[],
  optionalIds: string[],
) {
  const total = requiredIds.length + optionalIds.length;

  if (total === 0) return "0%";

  return `${(getCounts(stage, requiredIds, optionalIds).totalCount / total) * 100}%`;
}

function getMemberStatus(
  stage: ResponseStage,
  id: string,
  requiredIds: string[],
  optionalIds: string[],
): ResponseStatus {
  const { respondedIds, requiredCount } = getCounts(stage, requiredIds, optionalIds);

  if (!respondedIds.includes(id)) {
    if (optionalIds.includes(id) && requiredCount < requiredIds.length) return "요청 전";
    return "미응답";
  }

  return "가능";
}

function getMemberSelectedTime(id: string, status: ResponseStatus) {
  if (status === "미응답" || status === "요청 전") return "-";

  const unavailableSlot = candidateSlots.find((slot) =>
    slot.unavailableIds.includes(id),
  );

  if (unavailableSlot) return `${unavailableSlot.label} 불가능`;

  return "7월 15일 수요일 15:00–16:00 가능";
}

function getConfirmedScheduleInfo(title: string) {
  return {
    dateLabel: "7월 15일 수요일",
    displayDateTime: "7월 15일 수요일 15:00–16:00",
    id: confirmedScheduleId,
    meta: "7/15(수) 오후 3:00 · 참석자 6명",
    timeLabel: "15:00–16:00",
    title: title || "리뷰회의",
    weekday: "수요일",
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
  return (
    <article className="flex items-end px-[clamp(20px,4vw,56px)]">
      <AvatarBadge color="primary" initial={initial} />
      <div className="ml-2 flex max-w-[700px] flex-col items-start">
        <div className="flex h-[21px] items-center gap-1.5">
          <span className="text-sm font-bold leading-[21px] text-[#101828]">
            {author}
          </span>
          <span className="text-xs font-normal leading-[18px] text-[#98A2B3]">
            {time}
          </span>
        </div>
        <div className="mt-2 inline-flex min-h-11 max-w-[660px] items-center rounded-2xl bg-[#F7F6FF] px-4 py-2 text-sm font-medium leading-[21px] text-[#6F6A9F]">
          {message}
        </div>
      </div>
    </article>
  );
}

function ProgressBar({
  optionalIds,
  requiredIds,
  stage,
}: {
  optionalIds: string[];
  requiredIds: string[];
  stage: ResponseStage;
}) {
  const confirmed = stage === "confirmed";
  const allComplete = stage === "allComplete" || confirmed;
  const optionalStarted = ["optionalSent", "optionalOne", "optionalTwo", "allComplete", "confirmed"].includes(stage);

  return (
    <div className="relative pb-[44px]">
      <div className="absolute left-0 right-0 top-3 h-1 rounded-full bg-[#E5E7EB]">
        <div
          className="h-1 rounded-full bg-[#635BFF] transition-all duration-500 ease-out"
          style={{
            width: confirmed ? "100%" : progressPercent(stage, requiredIds, optionalIds),
          }}
        />
      </div>
      <div className="absolute inset-x-0 top-0">
        {["필수 응답", "선택 응답", "회의 확정"].map((label, index) => {
          const done =
            (index === 0 && optionalStarted) ||
            (index === 1 && allComplete) ||
            (index === 2 && confirmed);
          const active =
            (index === 0 && !optionalStarted) ||
            (index === 1 && optionalStarted && !allComplete) ||
            (index === 2 && allComplete && !confirmed);
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

function RecommendationResults({
  optionalIds,
  requiredIds,
}: {
  optionalIds: string[];
  requiredIds: string[];
}) {
  const totalAttendees = requiredIds.length + optionalIds.length;
  const eligibleSlots = candidateSlots.filter((slot) =>
    requiredIds.every((id) => slot.availableIds.includes(id)),
  );
  const allAvailableSlots = eligibleSlots.filter(
    (slot) => slot.availableIds.length === totalAttendees,
  );
  const firstAllAvailable = allAvailableSlots[0];
  const fasterAlternative = eligibleSlots.find(
    (slot) => slot.id === "slot-7-14-14",
  );
  const requiredFirst = eligibleSlots.find((slot) => slot.id === "slot-7-13-11");
  const cards = [
    firstAllAvailable
      ? {
          badge: "추천 1 · 전원 참석 가능",
          description: `${totalAttendees}명 모두 참석할 수 있는 가장 빠른 일정이에요.`,
          emphasis: true,
          id: "recommend-1",
          slot: firstAllAvailable,
        }
      : null,
    fasterAlternative
      ? {
          badge: "추천 2 · 더 빠른 대안",
          description: "일부 선택 참석자를 제외하면 더 빠르게 진행할 수 있어요.",
          emphasis: false,
          id: "recommend-2",
          slot: fasterAlternative,
        }
      : null,
    requiredFirst
      ? {
          badge: "추천 3 · 필수 참석자 우선",
          description: "현재 필수 참석자 모두가 가능한 가장 빠른 일정이에요.",
          emphasis: false,
          id: "recommend-3",
          slot: requiredFirst,
        }
      : null,
  ].filter(Boolean) as {
    badge: string;
    description: string;
    emphasis: boolean;
    id: string;
    slot: (typeof candidateSlots)[number];
  }[];
  const extraAllAvailableSlots = allAvailableSlots.filter(
    (slot) => slot.id !== firstAllAvailable?.id,
  );

  return (
    <section className="w-full max-w-[680px] rounded-xl border border-[#E0E4EB] bg-white p-5 shadow-[0_4px_16px_rgba(16,24,40,0.08)]">
      <div className="mb-4">
        <h3 className="text-lg font-bold leading-7 text-[#101828]">
          일정 집계 결과
        </h3>
        <p className="mt-1 text-sm font-medium leading-[21px] text-[#667085]">
          필수 참석자가 모두 가능한 후보만 추천합니다.
        </p>
      </div>
      <div className="space-y-3">
        {cards.map((card) => {
          const unavailableOptionalIds = optionalIds.filter((id) =>
            card.slot.unavailableIds.includes(id),
          );
          const unavailableOptionalNames = unavailableOptionalIds
            .map((id) => attendeeById(id)?.name)
            .filter(Boolean)
            .join(", ");
          const requiredNames = requiredIds
            .map((id) => attendeeById(id)?.name)
            .filter(Boolean)
            .join(", ");

          return (
          <article
            className={cn(
              "rounded-xl border p-4",
              card.emphasis
                ? "border-[#837CFF] bg-[#F7F6FF]"
                : "border-[#E0E4EB] bg-white",
            )}
            key={card.id}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-bold leading-[18px]",
                    card.emphasis
                      ? "bg-[#635BFF] text-white"
                      : "bg-[#F0EEFF] text-[#635BFF]",
                  )}
                >
                  {card.badge}
                </span>
                <h4 className="mt-3 text-base font-bold leading-6 text-[#101828]">
                  {card.slot.label}
                </h4>
              </div>
              <span className="shrink-0 text-sm font-bold leading-[21px] text-[#635BFF]">
                {totalAttendees}명 중 {card.slot.availableIds.length}명 참석 가능
              </span>
            </div>
            <div className="mt-3 space-y-1 text-sm font-medium leading-[21px] text-[#475467]">
              <p>필수 참석자 {requiredIds.length}명 참석 가능</p>
              <p>
                선택 참석자 {optionalIds.length - unavailableOptionalIds.length}명 참석 가능
              </p>
              {unavailableOptionalNames ? (
                <p className="font-bold text-[#667085]">
                  참석 어려움: {unavailableOptionalNames}
                </p>
              ) : null}
              {card.id === "recommend-3" ? (
                <p className="font-bold text-[#635BFF]">
                  필수 참석자 전원 가능: {requiredNames}
                </p>
              ) : null}
            </div>
            <p className="mt-3 text-sm font-bold leading-[21px] text-[#101828]">
              {card.description}
            </p>
          </article>
          );
        })}
      </div>
      {extraAllAvailableSlots.length > 0 ? (
        <div className="mt-4 rounded-lg border border-[#E0E4EB] bg-[#F9FAFB] px-4 py-3">
          <h4 className="text-sm font-bold leading-[21px] text-[#101828]">
            전원 참석 가능 추가 후보
          </h4>
          {extraAllAvailableSlots.map((slot, index) => (
            <p
              className="mt-2 text-sm font-medium leading-[21px] text-[#475467]"
              key={slot.id}
            >
              {index + 2}순위: {slot.label}
            </p>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function ManagementCard({
  onConfirm,
  onSendOptional,
  optionalIds,
  requiredIds,
  stage,
}: {
  onConfirm: () => void;
  onSendOptional: () => void;
  optionalIds: string[];
  requiredIds: string[];
  stage: ResponseStage;
}) {
  const { meeting, summaries } = useMeetingFlow();
  const { optionalCount, requiredCount, totalCount } = getCounts(
    stage,
    requiredIds,
    optionalIds,
  );
  const requiredComplete = requiredCount === requiredIds.length;
  const allComplete = stage === "allComplete" || stage === "confirmed";
  const confirmed = stage === "confirmed";
  const optionalSent = ["optionalSent", "optionalOne", "optionalTwo", "allComplete", "confirmed"].includes(stage);

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
              1시간 · 마감 {summaries.deadline} · {totalCount}/{meeting.attendeeIds.length}명 응답
            </p>
          </div>
        </div>
        <span className="rounded-full bg-[#635BFF] px-3 py-1 text-xs font-bold leading-[18px] text-white">
          {confirmed ? "회의 확정" : allComplete ? "집계 완료" : optionalSent ? "선택 응답 수집" : "필수 응답 수집"}
        </span>
      </div>

      <div className="grid h-[102px] grid-cols-2 border-b border-[#E0E4EB]">
        <div className="flex flex-col justify-center px-6">
          <span className="text-sm font-bold leading-[21px] text-[#98A2B3]">
            필수 참석자 응답
          </span>
          <span className="mt-1 text-[28px] font-bold leading-10 text-[#635BFF]">
            {requiredCount}/{requiredIds.length}명
          </span>
        </div>
        <div className="flex flex-col justify-center border-l border-[#E0E4EB] px-6">
          <span className="text-sm font-bold leading-[21px] text-[#98A2B3]">
            선택 참석자 응답
          </span>
          <span className="mt-1 text-[28px] font-bold leading-10 text-[#475467]">
            {optionalSent ? `${optionalCount}/${optionalIds.length}명` : "대기"}
          </span>
        </div>
      </div>

      <div className="border-b border-[#E0E4EB] px-6 py-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold leading-[21px] text-[#101828]">
            응답 진행
          </h3>
          <span className="text-xs font-medium leading-[18px] text-[#98A2B3]">
            {requiredComplete
              ? optionalSent
                ? "선택 참석자 응답 반영 중"
                : "필수 참석자 응답 완료"
              : `필수 참석자 ${requiredIds.length}명 중 ${requiredCount}명이 응답했어요.`}
          </span>
        </div>
        <ProgressBar optionalIds={optionalIds} requiredIds={requiredIds} stage={stage} />
      </div>

      <div className="flex items-center justify-between px-6 py-5">
        <div>
          <h3 className="text-base font-bold leading-6 text-[#101828]">
            {confirmed
              ? "회의를 확정했습니다."
              : allComplete
                ? "전체 응답을 기반으로 추천 일정을 확인하세요."
                : requiredComplete && !optionalSent
                  ? "필수 참석자의 응답이 모두 완료됐어요."
                  : "필수 참석자 응답을 먼저 기다리고 있습니다."}
          </h3>
          <p className="mt-1 text-[13px] font-medium leading-5 text-[#98A2B3]">
            {confirmed
              ? "참여자에게 일정이 공유되었습니다."
              : allComplete
                ? "전원 참석 가능 일정과 빠른 대안을 비교할 수 있습니다."
                : requiredComplete && !optionalSent
                  ? "이제 선택 참석자에게 후보 일정을 보낼 수 있습니다."
                  : "필수 참석자 응답 전에는 선택 참석자에게 요청하지 않습니다."}
          </p>
        </div>
        {requiredComplete && !optionalSent ? (
          <Button
            className="h-12 w-48 rounded-lg bg-[#635BFF] text-sm font-bold leading-[21px] text-white hover:bg-[#635BFF]/90 active:bg-[#554DE8]"
            onClick={onSendOptional}
          >
            선택 참석자에게 일정 보내기
          </Button>
        ) : (
          <Button
            className="h-12 w-36 rounded-lg bg-[#635BFF] text-base font-bold leading-6 text-white hover:bg-[#635BFF]/90 active:bg-[#554DE8]"
            disabled={!allComplete || confirmed}
            onClick={allComplete && !confirmed ? onConfirm : undefined}
          >
            {confirmed ? "확정 완료" : "회의 확정"}
          </Button>
        )}
      </div>
    </section>
  );
}

function ResponseTable({
  onRetry,
  optionalIds,
  requiredIds,
  stage,
}: {
  onRetry: (id: string) => void;
  optionalIds: string[];
  requiredIds: string[];
  stage: ResponseStage;
}) {
  return (
    <section className="w-full max-w-[680px] rounded-xl border border-[#E0E4EB] bg-white p-5 shadow-[0_4px_16px_rgba(16,24,40,0.08)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold leading-7 text-[#101828]">
            응답 현황
          </h3>
          <p className="mt-1 text-sm font-medium leading-[21px] text-[#667085]">
            팀원별 선택 날짜와 시간을 확인합니다.
          </p>
        </div>
      </div>
      <div className="space-y-3">
        {attendees.map((attendee) => {
          const required = requiredIds.includes(attendee.id);
          const status = getMemberStatus(stage, attendee.id, requiredIds, optionalIds);
          const pending = status === "미응답";

          return (
            <div
              className="rounded-lg border border-[#E0E4EB] bg-[#F9FAFB] px-4 py-3"
              key={attendee.id}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold leading-[21px] text-[#101828]">
                      {attendee.name}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-[2px] text-[11px] font-bold leading-[16px]",
                        required
                          ? "bg-[#F0EEFF] text-[#635BFF]"
                          : "bg-[#F3F4F6] text-[#667085]",
                      )}
                    >
                      {roleBadge(required)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium leading-[21px] text-[#667085]">
                    {getMemberSelectedTime(attendee.id, status)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-bold leading-[18px]",
                      status === "가능" && "bg-[#F0EEFF] text-[#635BFF]",
                      status === "불가능" && "bg-[#FFF4ED] text-[#B54708]",
                      status === "미응답" && "bg-[#F3F4F6] text-[#667085]",
                      status === "요청 전" && "bg-[#F3F4F6] text-[#98A2B3]",
                    )}
                  >
                    {status}
                  </span>
                  {pending ? (
                    <Button
                      className="h-8 rounded-lg border border-[#E0E4EB] bg-white px-3 text-xs font-bold leading-[18px] text-[#475467] hover:bg-[#F9FAFB]"
                      onClick={() => onRetry(attendee.id)}
                    >
                      다시 요청
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function StatusPanel({
  confirmedSchedule,
  onRetry,
  onViewSchedule,
  optionalIds,
  requiredIds,
  stage,
}: {
  confirmedSchedule: ReturnType<typeof getConfirmedScheduleInfo>;
  onRetry: (id: string) => void;
  onViewSchedule: () => void;
  optionalIds: string[];
  requiredIds: string[];
  stage: ResponseStage;
}) {
  const { optionalCount, requiredCount, totalCount } = getCounts(
    stage,
    requiredIds,
    optionalIds,
  );
  const confirmed = stage === "confirmed";
  const allComplete = stage === "allComplete" || confirmed;
  const totalAttendees = requiredIds.length + optionalIds.length;

  return (
    <aside className="flex h-[100dvh] max-h-[100dvh] w-[328px] shrink-0 flex-col overflow-hidden border-l border-[#E5E7EB] bg-[#F9FAFB]">
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-7">
        <h2 className="text-[26px] font-bold leading-9 text-[#101828]">
          응답 현황
        </h2>
        <p className="mt-2 text-sm font-medium leading-[21px] text-[#475467]">
          {requiredCount < requiredIds.length
            ? `필수 참석자 ${requiredIds.length}명 중 ${requiredCount}명이 응답했어요.`
            : optionalCount < optionalIds.length
              ? `선택 참석자 ${optionalIds.length}명 중 ${optionalCount}명이 응답했어요.`
              : "필수 참석자의 응답이 모두 완료됐어요."}
        </p>

        <section className="mt-6 rounded-xl border border-[#E0E4EB] bg-white p-5">
          <span className="rounded-full bg-[#F7F6FF] px-3 py-1 text-xs font-bold leading-[18px] text-[#6F6A9F]">
            {confirmed ? "회의 확정" : allComplete ? "집계 완료" : "응답 수집"}
          </span>
          <h3 className="mt-5 text-[30px] font-bold leading-10 text-[#635BFF]">
            {totalCount}/{totalAttendees}명 응답
          </h3>
          <div className="mt-4 h-1.5 rounded-full bg-[#E5E7EB]">
            <div
              className="h-1.5 rounded-full bg-[#635BFF] transition-all duration-500 ease-out"
              style={{
                width: confirmed
                  ? "100%"
                  : progressPercent(stage, requiredIds, optionalIds),
              }}
            />
          </div>
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between text-sm font-medium leading-[21px]">
              <span className="text-[#475467]">필수 참석자</span>
              <span className="text-[#635BFF]">
                {requiredCount}/{requiredIds.length}명 완료
              </span>
            </div>
            <div className="flex items-center justify-between text-sm font-medium leading-[21px]">
              <span className="text-[#475467]">선택 참석자</span>
              <span className="text-[#667085]">
                {optionalCount}/{optionalIds.length}명 완료
              </span>
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-xl border border-[#E0E4EB] bg-white p-5">
          <h3 className="text-sm font-bold leading-[21px] text-[#101828]">
            팀원별 상태
          </h3>
          <div className="mt-4 space-y-3">
            {attendees.map((attendee) => {
              const required = requiredIds.includes(attendee.id);
              const status = getMemberStatus(stage, attendee.id, requiredIds, optionalIds);

              return (
                <div
                  className="flex items-center justify-between gap-3 text-sm font-medium leading-[21px]"
                  key={attendee.id}
                >
                  <span className="flex min-w-0 items-center gap-2 text-[#475467]">
                    {shortName(attendee.name)}
                    {required ? (
                      <span className="rounded-full bg-[#F0EEFF] px-2 py-[2px] text-[11px] font-bold leading-[16px] text-[#635BFF]">
                        필수
                      </span>
                    ) : null}
                  </span>
                  <span
                    className={cn(
                      status === "가능" && "text-[#635BFF]",
                      status === "미응답" && "text-[#98A2B3]",
                      status === "요청 전" && "text-[#98A2B3]",
                    )}
                  >
                    {status}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {getCounts(stage, requiredIds, optionalIds).respondedIds.length <
        totalAttendees ? (
          <Button
            className="mt-5 h-12 w-full rounded-lg bg-[#635BFF] text-sm font-bold leading-[21px] text-white hover:bg-[#635BFF]/90 active:bg-[#554DE8]"
            onClick={() => onRetry("all")}
          >
            미응답자에게 다시 요청
          </Button>
        ) : null}

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
  const { meeting } = useMeetingFlow();
  const [stage, setStage] = useState<ResponseStage>("requiredCollecting");
  const [optionalStarted, setOptionalStarted] = useState(false);
  const [retryMessage, setRetryMessage] = useState("");
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const previousMessageCountRef = useRef(0);
  const confirmedSchedule = useMemo(
    () => getConfirmedScheduleInfo(meeting.title),
    [meeting.title],
  );
  const requiredParticipantIds = useMemo(
    () =>
      meeting.attendeeIds.filter((id) => meeting.requiredAttendeeIds.includes(id)),
    [meeting.attendeeIds, meeting.requiredAttendeeIds],
  );
  const optionalParticipantIds = useMemo(
    () =>
      meeting.attendeeIds.filter(
        (id) => !meeting.requiredAttendeeIds.includes(id),
      ),
    [meeting.attendeeIds, meeting.requiredAttendeeIds],
  );

  useEffect(() => {
    const hyeTimer = window.setTimeout(() => setStage("requiredOne"), 1000);
    const minTimer = window.setTimeout(() => setStage("requiredTwo"), 2000);
    const junTimer = window.setTimeout(() => setStage("requiredComplete"), 3000);

    return () => {
      window.clearTimeout(hyeTimer);
      window.clearTimeout(minTimer);
      window.clearTimeout(junTimer);
    };
  }, []);

  useEffect(() => {
    if (!optionalStarted) return undefined;

    const sentTimer = window.setTimeout(() => setStage("optionalSent"), 0);
    const seoTimer = window.setTimeout(() => setStage("optionalOne"), 1000);
    const jiTimer = window.setTimeout(() => setStage("optionalTwo"), 2000);
    const eunTimer = window.setTimeout(() => setStage("allComplete"), 3000);

    return () => {
      window.clearTimeout(sentTimer);
      window.clearTimeout(seoTimer);
      window.clearTimeout(jiTimer);
      window.clearTimeout(eunTimer);
    };
  }, [optionalStarted]);

  const followUpMessages = useMemo<FollowUpMessage[]>(() => {
    const messages: FollowUpMessage[] = [];

    if (
      requiredParticipantIds[0] &&
      ["requiredOne", "requiredTwo", "requiredComplete", "optionalSent", "optionalOne", "optionalTwo", "allComplete", "confirmed"].includes(stage)
    ) {
      messages.push({
        id: "owner-response",
        author: "MFlow",
        initial: "M",
        time: "오전 10:12",
        message: `${attendeeById(requiredParticipantIds[0])?.name ?? "필수 참석자"}님이 응답했습니다.`,
      });
    }
    if (
      requiredParticipantIds[1] &&
      ["requiredTwo", "requiredComplete", "optionalSent", "optionalOne", "optionalTwo", "allComplete", "confirmed"].includes(stage)
    ) {
      messages.push({
        id: "min-response",
        author: "MFlow",
        initial: "M",
        time: "오전 10:13",
        message: `${attendeeById(requiredParticipantIds[1])?.name ?? "필수 참석자"}님이 응답했습니다.`,
      });
    }
    if (
      requiredParticipantIds.length > 0 &&
      ["requiredComplete", "optionalSent", "optionalOne", "optionalTwo", "allComplete", "confirmed"].includes(stage)
    ) {
      messages.push({
        id: "jun-response",
        author: "MFlow",
        initial: "M",
        time: "오전 10:14",
        message: "필수 참석자의 응답이 모두 완료됐어요.",
      });
    }
    if (["optionalSent", "optionalOne", "optionalTwo", "allComplete", "confirmed"].includes(stage)) {
      messages.push({
        id: "optional-sent",
        author: "MFlow",
        initial: "M",
        time: "오전 10:15",
        message: "선택 참석자에게 후보 일정을 보냈습니다.",
      });
    }
    if (["optionalOne", "optionalTwo", "allComplete", "confirmed"].includes(stage)) {
      messages.push({
        id: "seo-response",
        author: "MFlow",
        initial: "M",
        time: "오전 10:16",
        message: `${attendeeById(optionalParticipantIds[0])?.name ?? "선택 참석자"}님이 응답했습니다.`,
      });
    }
    if (["optionalTwo", "allComplete", "confirmed"].includes(stage)) {
      messages.push({
        id: "ji-response",
        author: "MFlow",
        initial: "M",
        time: "오전 10:17",
        message: `${attendeeById(optionalParticipantIds[1])?.name ?? "선택 참석자"}님이 응답했습니다.`,
      });
    }
    if (["allComplete", "confirmed"].includes(stage)) {
      messages.push({
        id: "eun-response",
        author: "MFlow",
        initial: "M",
        time: "오전 10:18",
        message: `${attendeeById(optionalParticipantIds[2])?.name ?? "선택 참석자"}님이 응답했습니다. 전체 응답을 기반으로 일정 집계를 완료했습니다.`,
      });
    }
    if (retryMessage) {
      messages.push({
        id: "retry-request",
        author: "MFlow",
        initial: "M",
        time: "오전 10:19",
        message: retryMessage,
      });
    }
    if (stage === "confirmed") {
      messages.push(
        {
          id: "meeting-confirmed",
          author: "MFlow",
          initial: "M",
          time: "오전 10:20",
          message: "회의를 확정했습니다.",
        },
        {
          id: "schedule-shared",
          author: "MFlow",
          initial: "M",
          time: "오전 10:21",
          message: "참여자에게 일정을 공유했습니다.",
        },
        {
          id: "confirmed-schedule",
          author: "MFlow",
          initial: "M",
          time: "오전 10:22",
          message: `${confirmedSchedule.title}가 ${confirmedSchedule.displayDateTime}로 확정되었습니다.`,
        },
      );
    }

    return messages;
  }, [confirmedSchedule, optionalParticipantIds, requiredParticipantIds, retryMessage, stage]);

  useEffect(() => {
    const previousCount = previousMessageCountRef.current;
    previousMessageCountRef.current = followUpMessages.length;

    if (followUpMessages.length <= previousCount && stage !== "allComplete") return;

    window.requestAnimationFrame(() => {
      const scrollContainer = chatScrollRef.current;

      if (!scrollContainer) return;

      scrollContainer.scrollTo({
        behavior: "smooth",
        top: scrollContainer.scrollHeight,
      });
    });
  }, [followUpMessages.length, stage]);

  function sendOptionalRequests() {
    if (optionalStarted) return;
    setOptionalStarted(true);
  }

  function retryRequest(id: string) {
    const target =
      id === "all" ? "미응답자" : `${attendeeById(id)?.name ?? "미응답자"}님`;

    setRetryMessage(`${target}에게 다시 요청을 보냈습니다.`);
  }

  function confirmMeeting() {
    if (stage !== "allComplete") return;
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
            <div className="flex w-full flex-col gap-5">
              <ManagementCard
                onConfirm={confirmMeeting}
                onSendOptional={sendOptionalRequests}
                optionalIds={optionalParticipantIds}
                requiredIds={requiredParticipantIds}
                stage={stage}
              />
              {followUpMessages.length > 0 ? (
                <div className="flex w-full flex-col gap-3">
                  {followUpMessages.map((message) => (
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
              <ResponseTable
                onRetry={retryRequest}
                optionalIds={optionalParticipantIds}
                requiredIds={requiredParticipantIds}
                stage={stage}
              />
              {(stage === "allComplete" || stage === "confirmed") && (
                <RecommendationResults
                  optionalIds={optionalParticipantIds}
                  requiredIds={requiredParticipantIds}
                />
              )}
            </div>
          </div>
          <ResponseComposer />
        </div>
        <StatusPanel
          confirmedSchedule={confirmedSchedule}
          onRetry={retryRequest}
          onViewSchedule={viewConfirmedSchedule}
          optionalIds={optionalParticipantIds}
          requiredIds={requiredParticipantIds}
          stage={stage}
        />
      </div>
    </MeetFlowLayout>
  );
}
