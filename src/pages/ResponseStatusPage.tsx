import { Check } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AvatarBadge } from "@/components/AvatarBadge";
import { MeetFlowLayout } from "@/components/MeetFlowLayout";
import { Button } from "@/components/ui/button";
import {
  baseAvailabilitySlots,
  getAdditionalAllAvailableSlots,
  getRecommendationCards,
} from "@/context/availabilityUtils";
import { useMeetingFlow } from "@/context/useMeetingFlow";
import { attendees } from "@/mocks";
import { cn } from "@/lib/utils";

type ResponseStage =
  | "requiredCollecting"
  | "requiredAggregating"
  | "adjustmentPending"
  | "dateConfirmed"
  | "optionalCollecting"
  | "allComplete"
  | "confirmed";

type FollowUpMessage = {
  id: string;
  author: string;
  initial: string;
  time: string;
  message: string;
};

type ResponseStatus = "희망" | "가능" | "불가능" | "미응답" | "요청 전";

type ParticipantResponse = {
  preferredSlotId: string;
  unavailableSlotIds: string[];
};

const scheduleStorageKey = "mflow-my-schedule-cards";
const confirmedScheduleId = "confirmed-review-meeting";

function attendeeById(id: string) {
  return attendees.find((attendee) => attendee.id === id);
}

function shortName(name: string) {
  return name.length > 2 ? name.slice(-2) : name;
}

function roleBadge(required: boolean) {
  return required ? "필수 참석자" : "선택 참석자";
}

const responseProfiles: Record<string, ParticipantResponse> = {
  owner: {
    preferredSlotId: "slot-7-15-15",
    unavailableSlotIds: [],
  },
  min: {
    preferredSlotId: "slot-7-15-15",
    unavailableSlotIds: [],
  },
  jun: {
    preferredSlotId: "slot-7-14-14",
    unavailableSlotIds: ["slot-7-15-15"],
  },
  seo: {
    preferredSlotId: "slot-7-15-15",
    unavailableSlotIds: ["slot-7-13-11", "slot-7-14-14"],
  },
  ji: {
    preferredSlotId: "slot-7-15-15",
    unavailableSlotIds: ["slot-7-13-11", "slot-7-14-14"],
  },
  eun: {
    preferredSlotId: "slot-7-15-15",
    unavailableSlotIds: ["slot-7-13-11"],
  },
};

function responseProfile(id: string): ParticipantResponse {
  return (
    responseProfiles[id] ?? {
      preferredSlotId: "slot-7-15-15",
      unavailableSlotIds: [],
    }
  );
}

function slotById(id: string) {
  return baseAvailabilitySlots.find((slot) => slot.id === id) ?? baseAvailabilitySlots[0];
}

function respondedRequiredIds(requiredIds: string[], count: number) {
  return requiredIds.slice(0, Math.min(count, requiredIds.length));
}

function respondedOptionalIds(optionalIds: string[], count: number) {
  return optionalIds.slice(0, Math.min(count, optionalIds.length));
}

function getCounts(
  requiredIds: string[],
  optionalIds: string[],
  requiredResponseCount: number,
  optionalResponseCount: number,
) {
  const requiredRespondedIds = respondedRequiredIds(requiredIds, requiredResponseCount);
  const optionalRespondedIds = respondedOptionalIds(optionalIds, optionalResponseCount);
  const respondedIds = [...requiredRespondedIds, ...optionalRespondedIds];

  return {
    optionalCount: optionalRespondedIds.length,
    requiredCount: requiredRespondedIds.length,
    respondedIds,
    totalCount: respondedIds.length,
  };
}

function progressPercent(
  requiredIds: string[],
  optionalIds: string[],
  requiredResponseCount: number,
  optionalResponseCount: number,
) {
  const total = requiredIds.length + optionalIds.length;

  if (total === 0) return "0%";

  return `${(getCounts(requiredIds, optionalIds, requiredResponseCount, optionalResponseCount).totalCount / total) * 100}%`;
}

function getRequiredAggregation(requiredIds: string[], requiredResponseCount: number) {
  const requiredRespondedIds = respondedRequiredIds(requiredIds, requiredResponseCount);
  const sortedSlots = [...baseAvailabilitySlots].sort((a, b) => {
    const aHope = requiredRespondedIds.filter(
      (id) => responseProfile(id).preferredSlotId === a.id,
    ).length;
    const bHope = requiredRespondedIds.filter(
      (id) => responseProfile(id).preferredSlotId === b.id,
    ).length;
    const aAvailable = requiredRespondedIds.filter(
      (id) => !responseProfile(id).unavailableSlotIds.includes(a.id),
    ).length;
    const bAvailable = requiredRespondedIds.filter(
      (id) => !responseProfile(id).unavailableSlotIds.includes(b.id),
    ).length;

    if (bHope !== aHope) return bHope - aHope;
    if (bAvailable !== aAvailable) return bAvailable - aAvailable;

    return baseAvailabilitySlots.findIndex((slot) => slot.id === a.id) -
      baseAvailabilitySlots.findIndex((slot) => slot.id === b.id);
  });
  const selectedSlot = sortedSlots[0] ?? baseAvailabilitySlots[0];
  const hopeIds = requiredRespondedIds.filter(
    (id) => responseProfile(id).preferredSlotId === selectedSlot.id,
  );
  const unavailableIds = requiredRespondedIds.filter((id) =>
    responseProfile(id).unavailableSlotIds.includes(selectedSlot.id),
  );
  const possibleIds = requiredRespondedIds.filter(
    (id) => !responseProfile(id).unavailableSlotIds.includes(selectedSlot.id),
  );

  return {
    hopeIds,
    possibleIds,
    selectedSlot,
    unavailableIds,
  };
}

function flowStageLabel(stage: ResponseStage) {
  const labels: Record<ResponseStage, string> = {
    requiredCollecting: "필수 참석자 응답 수집 중",
    requiredAggregating: "다수 선택 날짜 집계",
    adjustmentPending: "일정 조정 확인 중",
    dateConfirmed: "필수 참석자 날짜 1차 확정",
    optionalCollecting: "선택 참석자 시간 응답 수집 중",
    allComplete: "최종 일정 확정 준비",
    confirmed: "최종 일정 확정",
  };

  return labels[stage];
}

function getMemberStatus(
  stage: ResponseStage,
  id: string,
  requiredIds: string[],
  optionalIds: string[],
  requiredResponseCount: number,
  optionalResponseCount: number,
  selectedSlotId: string,
  adjustmentResolved: boolean,
): ResponseStatus {
  const requiredResponded = respondedRequiredIds(requiredIds, requiredResponseCount);
  const optionalResponded = respondedOptionalIds(optionalIds, optionalResponseCount);
  const required = requiredIds.includes(id);
  const optional = optionalIds.includes(id);

  if (required && !requiredResponded.includes(id)) return "미응답";
  if (optional && !optionalResponded.includes(id)) {
    if (!["optionalCollecting", "allComplete", "confirmed"].includes(stage)) {
      return "요청 전";
    }
    return "미응답";
  }

  const response = responseProfile(id);

  if (
    required &&
    response.unavailableSlotIds.includes(selectedSlotId) &&
    !adjustmentResolved
  ) {
    return "불가능";
  }

  if (response.preferredSlotId === selectedSlotId) return "희망";

  return "가능";
}

function getMemberSelectedTime(
  id: string,
  status: ResponseStatus,
  selectedSlotId: string,
) {
  if (status === "미응답" || status === "요청 전") return "-";

  const response = responseProfile(id);
  const preferredSlot = slotById(response.preferredSlotId);
  const selectedSlot = slotById(selectedSlotId);
  const unavailableSlots = response.unavailableSlotIds
    .map(slotById)
    .map((slot) => slot.label)
    .join(", ");

  if (status === "불가능") return `희망: ${preferredSlot.label} · 불가능: ${selectedSlot.label}`;
  if (unavailableSlots) return `희망: ${preferredSlot.label} · 불가능: ${unavailableSlots}`;

  return `희망: ${preferredSlot.label}`;
}

const meetingRooms = [
  { capacity: 6, id: "room-a", name: "A 회의실" },
  { capacity: 8, id: "room-b", name: "B 회의실" },
  { capacity: 10, id: "room-c", name: "C 회의실" },
];

function roomById(id: string) {
  return meetingRooms.find((room) => room.id === id);
}

function getMeetingLocationLabel(meeting: ReturnType<typeof useMeetingFlow>["meeting"]) {
  if (meeting.locationType === "internal") {
    if (meeting.selectedRoomId) {
      const room = roomById(meeting.selectedRoomId);

      return room ? room.name : "회의실 미정";
    }

    return "회의실 미정";
  }

  if (meeting.locationType === "online") {
    return meeting.videoLinkMode === "manual" && meeting.videoLink.trim()
      ? meeting.videoLink
      : "화상회의 링크 추후 생성";
  }

  if (meeting.locationType === "external") {
    return meeting.externalLocationName.trim() || "외부 장소 미정";
  }

  return "장소 미정";
}

function getConfirmedScheduleInfo(
  title: string,
  slot = slotById("slot-7-15-15"),
  attendeeCount = 6,
  locationLabel = "장소 미정",
) {
  return {
    dateLabel: slot.dateLabel,
    displayDateTime: slot.label,
    id: confirmedScheduleId,
    locationLabel,
    meta: `${slot.shortDateLabel} ${slot.timeLabel} · 참석자 ${attendeeCount}명 · ${locationLabel}`,
    timeLabel: slot.timeLabel,
    title: title || "리뷰회의",
    weekday: slot.dateLabel.replace(/^.+\s/, ""),
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
  optionalResponseCount,
  requiredResponseCount,
  requiredIds,
  stage,
}: {
  optionalIds: string[];
  optionalResponseCount: number;
  requiredResponseCount: number;
  requiredIds: string[];
  stage: ResponseStage;
}) {
  const confirmed = stage === "confirmed";
  const allComplete = stage === "allComplete" || confirmed;
  const dateConfirmed = ["dateConfirmed", "optionalCollecting", "allComplete", "confirmed"].includes(stage);

  return (
    <div className="relative pb-[44px]">
      <div className="absolute left-0 right-0 top-3 h-1 rounded-full bg-[#E5E7EB]">
        <div
          className="h-1 rounded-full bg-[#635BFF] transition-all duration-500 ease-out"
          style={{
            width: confirmed
              ? "100%"
              : progressPercent(
                  requiredIds,
                  optionalIds,
                  requiredResponseCount,
                  optionalResponseCount,
                ),
          }}
        />
      </div>
      <div className="absolute inset-x-0 top-0">
        {["필수 응답", "날짜 확정", "회의 확정"].map((label, index) => {
          const done =
            (index === 0 && dateConfirmed) ||
            (index === 1 && allComplete) ||
            (index === 2 && confirmed);
          const active =
            (index === 0 && !dateConfirmed) ||
            (index === 1 && dateConfirmed && !allComplete) ||
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
  const { meeting } = useMeetingFlow();
  const totalAttendees = requiredIds.length + optionalIds.length;
  const cards = getRecommendationCards(meeting);
  const extraAllAvailableSlots = getAdditionalAllAvailableSlots(meeting);

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
              {card.kind === "requiredOnly" ? (
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
  adjustmentResolved,
  aggregation,
  onConfirm,
  onRequestAdjustment,
  onSendOptional,
  optionalIds,
  optionalResponseCount,
  optionalStarted,
  requiredResponseCount,
  requiredIds,
  stage,
}: {
  adjustmentResolved: boolean;
  aggregation: ReturnType<typeof getRequiredAggregation>;
  onConfirm: () => void;
  onRequestAdjustment: () => void;
  onSendOptional: () => void;
  optionalIds: string[];
  optionalResponseCount: number;
  optionalStarted: boolean;
  requiredResponseCount: number;
  requiredIds: string[];
  stage: ResponseStage;
}) {
  const { meeting, summaries } = useMeetingFlow();
  const { optionalCount, requiredCount, totalCount } = getCounts(
    requiredIds,
    optionalIds,
    requiredResponseCount,
    optionalResponseCount,
  );
  const requiredComplete = requiredCount === requiredIds.length;
  const allComplete = stage === "allComplete" || stage === "confirmed";
  const confirmed = stage === "confirmed";
  const dateConfirmed = ["dateConfirmed", "optionalCollecting", "allComplete", "confirmed"].includes(stage);
  const adjustmentNeeded =
    requiredComplete &&
    aggregation.unavailableIds.length > 0 &&
    !adjustmentResolved;
  const unavailableNames = aggregation.unavailableIds
    .map((id) => attendeeById(id)?.name)
    .filter(Boolean)
    .join(", ");
  const headline = confirmed
    ? "회의를 확정했습니다."
    : allComplete
      ? "전체 응답을 기반으로 추천 일정을 확인하세요."
      : adjustmentNeeded
        ? `필수 참석자 ${requiredIds.length}명 중 ${aggregation.hopeIds.length}명이 ${aggregation.selectedSlot.dateLabel}을 선택했어요.`
        : dateConfirmed && !optionalStarted
          ? "필수 참석자 일정이 1차 확정됐어요."
          : requiredComplete
            ? "필수 참석자의 응답이 모두 완료됐어요."
            : "필수 참석자 응답을 먼저 기다리고 있습니다.";
  const description = confirmed
    ? "참여자에게 일정이 공유되었습니다."
    : allComplete
      ? "전원 참석 가능 일정과 빠른 대안을 비교할 수 있습니다."
      : adjustmentNeeded
        ? `${unavailableNames}님의 일정 조정 확인이 필요해요.`
        : dateConfirmed && !optionalStarted
          ? `${aggregation.selectedSlot.dateLabel} 중 가능한 시간을 선택 참석자에게 물어볼 수 있습니다.`
          : requiredComplete
            ? "필수 참석자 응답을 기준으로 날짜를 집계했습니다."
            : "필수 참석자 응답 전에는 선택 참석자에게 요청하지 않습니다.";

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
          {flowStageLabel(stage)}
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
            {optionalStarted ? `${optionalCount}/${optionalIds.length}명` : "요청 전"}
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
              ? optionalStarted
                ? "선택 참석자 응답 반영 중"
                : adjustmentNeeded
                  ? `${unavailableNames}님의 일정 조정 확인이 필요해요.`
                  : "필수 참석자 날짜가 1차 확정됐어요."
              : `필수 참석자 ${requiredIds.length}명 중 ${requiredCount}명이 응답했어요.`}
          </span>
        </div>
        <ProgressBar
          optionalIds={optionalIds}
          optionalResponseCount={optionalResponseCount}
          requiredIds={requiredIds}
          requiredResponseCount={requiredResponseCount}
          stage={stage}
        />
      </div>

      <div className="flex items-center justify-between px-6 py-5">
        <div>
          <h3 className="text-base font-bold leading-6 text-[#101828]">
            {headline}
          </h3>
          <p className="mt-1 text-[13px] font-medium leading-5 text-[#98A2B3]">
            {description}
          </p>
        </div>
        {adjustmentNeeded ? (
          <Button
            className="h-12 w-40 rounded-lg bg-[#635BFF] text-sm font-bold leading-[21px] text-white hover:bg-[#635BFF]/90 active:bg-[#554DE8]"
            onClick={onRequestAdjustment}
          >
            일정 조정 요청
          </Button>
        ) : dateConfirmed && !optionalStarted && optionalIds.length > 0 ? (
          <Button
            className="h-12 w-48 rounded-lg bg-[#635BFF] text-sm font-bold leading-[21px] text-white hover:bg-[#635BFF]/90 active:bg-[#554DE8]"
            onClick={onSendOptional}
          >
            선택 참석자에게 일정 보내기
          </Button>
        ) : (
          <Button
            className="h-12 w-36 rounded-lg bg-[#635BFF] text-base font-bold leading-6 text-white hover:bg-[#635BFF]/90 active:bg-[#554DE8]"
            disabled={(!allComplete && optionalIds.length > 0) || confirmed || !dateConfirmed}
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
  adjustmentResolved,
  attendeeIds,
  onRetry,
  optionalIds,
  optionalResponseCount,
  requiredResponseCount,
  requiredIds,
  selectedSlotId,
  stage,
}: {
  adjustmentResolved: boolean;
  attendeeIds: string[];
  onRetry: (id: string) => void;
  optionalIds: string[];
  optionalResponseCount: number;
  requiredResponseCount: number;
  requiredIds: string[];
  selectedSlotId: string;
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
        {attendeeIds.map((attendeeId) => {
          const attendee = attendeeById(attendeeId);

          if (!attendee) return null;

          const required = requiredIds.includes(attendee.id);
          const status = getMemberStatus(
            stage,
            attendee.id,
            requiredIds,
            optionalIds,
            requiredResponseCount,
            optionalResponseCount,
            selectedSlotId,
            adjustmentResolved,
          );
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
                    {getMemberSelectedTime(attendee.id, status, selectedSlotId)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-bold leading-[18px]",
                      status === "희망" && "bg-[#F0EEFF] text-[#635BFF]",
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
  adjustmentResolved,
  attendeeIds,
  confirmedSchedule,
  onRequestAdjustment,
  onRetry,
  onSendOptional,
  onChangeRoom,
  onViewSchedule,
  optionalIds,
  optionalResponseCount,
  optionalStarted,
  requiredResponseCount,
  requiredIds,
  selectedSlotId,
  stage,
}: {
  adjustmentResolved: boolean;
  attendeeIds: string[];
  confirmedSchedule: ReturnType<typeof getConfirmedScheduleInfo>;
  onRequestAdjustment: () => void;
  onRetry: (id: string) => void;
  onSendOptional: () => void;
  onChangeRoom: () => void;
  onViewSchedule: () => void;
  optionalIds: string[];
  optionalResponseCount: number;
  optionalStarted: boolean;
  requiredResponseCount: number;
  requiredIds: string[];
  selectedSlotId: string;
  stage: ResponseStage;
}) {
  const { optionalCount, requiredCount, respondedIds, totalCount } = getCounts(
    requiredIds,
    optionalIds,
    requiredResponseCount,
    optionalResponseCount,
  );
  const confirmed = stage === "confirmed";
  const allComplete = stage === "allComplete" || confirmed;
  const totalAttendees = requiredIds.length + optionalIds.length;
  const dateConfirmed = ["dateConfirmed", "optionalCollecting", "allComplete", "confirmed"].includes(stage);
  const adjustmentPending =
    respondedRequiredIds(requiredIds, requiredResponseCount).some((id) =>
      responseProfile(id).unavailableSlotIds.includes(selectedSlotId),
    ) && !adjustmentResolved;

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
              ? optionalStarted
                ? `선택 참석자 ${optionalIds.length}명 중 ${optionalCount}명이 응답했어요.`
                : "선택 참석자는 아직 요청 전입니다."
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
                  : progressPercent(
                      requiredIds,
                      optionalIds,
                      requiredResponseCount,
                      optionalResponseCount,
                    ),
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
                {optionalStarted
                  ? `${optionalCount}/${optionalIds.length}명 완료`
                  : "요청 전"}
              </span>
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-xl border border-[#E0E4EB] bg-white p-5">
          <h3 className="text-sm font-bold leading-[21px] text-[#101828]">
            팀원별 상태
          </h3>
          <div className="mt-4 space-y-3">
            {attendeeIds.map((attendeeId) => {
              const attendee = attendeeById(attendeeId);

              if (!attendee) return null;

              const required = requiredIds.includes(attendee.id);
              const status = getMemberStatus(
                stage,
                attendee.id,
                requiredIds,
                optionalIds,
                requiredResponseCount,
                optionalResponseCount,
                selectedSlotId,
                adjustmentResolved,
              );

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
                      status === "희망" && "text-[#635BFF]",
                      status === "가능" && "text-[#635BFF]",
                      status === "불가능" && "text-[#B54708]",
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

        {adjustmentPending ? (
          <Button
            className="mt-5 h-12 w-full rounded-lg bg-[#635BFF] text-sm font-bold leading-[21px] text-white hover:bg-[#635BFF]/90 active:bg-[#554DE8]"
            onClick={onRequestAdjustment}
          >
            일정 조정 요청
          </Button>
        ) : dateConfirmed && !optionalStarted && optionalIds.length > 0 ? (
          <Button
            className="mt-5 h-12 w-full rounded-lg bg-[#635BFF] text-sm font-bold leading-[21px] text-white hover:bg-[#635BFF]/90 active:bg-[#554DE8]"
            onClick={onSendOptional}
          >
            선택 참석자에게 일정 보내기
          </Button>
        ) : respondedIds.length < totalAttendees ? (
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
            <p className="mt-1 text-sm font-medium leading-[21px] text-[#635BFF]">
              {confirmedSchedule.locationLabel}
            </p>
            <p className="mt-3 text-sm font-medium leading-[21px] text-[#635BFF]">
              모든 참여자 {totalAttendees}명에게 확정된 일정을 공유했습니다.
            </p>
            <Button
              className="mt-4 h-10 w-full rounded-lg border border-[#D8D5F7] bg-white text-sm font-bold leading-[21px] text-[#635BFF] hover:bg-[#F7F6FF]"
              onClick={onChangeRoom}
            >
              회의실 지정/변경
            </Button>
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
  const { meeting, setReceivedRequestStatus, updateMeeting } = useMeetingFlow();
  const [requiredResponseCount, setRequiredResponseCount] = useState(0);
  const [optionalResponseCount, setOptionalResponseCount] = useState(0);
  const [adjustmentRequested, setAdjustmentRequested] = useState(false);
  const [adjustmentResolved, setAdjustmentResolved] = useState(false);
  const [optionalStarted, setOptionalStarted] = useState(false);
  const [retryMessage, setRetryMessage] = useState("");
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const previousMessageCountRef = useRef(0);
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
  const requiredAggregation = useMemo(
    () => getRequiredAggregation(requiredParticipantIds, requiredResponseCount),
    [requiredParticipantIds, requiredResponseCount],
  );
  const confirmedSchedule = useMemo(
    () =>
      getConfirmedScheduleInfo(
        meeting.title,
        requiredAggregation.selectedSlot,
        meeting.attendeeIds.length,
        getMeetingLocationLabel(meeting),
      ),
    [meeting, requiredAggregation.selectedSlot],
  );
  const requiredComplete =
    requiredParticipantIds.length === 0 ||
    requiredResponseCount >= requiredParticipantIds.length;
  const adjustmentNeeded =
    requiredComplete &&
    requiredAggregation.unavailableIds.length > 0 &&
    !adjustmentResolved;
  const dateConfirmed =
    requiredComplete && (!requiredAggregation.unavailableIds.length || adjustmentResolved);
  const optionalComplete =
    optionalStarted && optionalResponseCount >= optionalParticipantIds.length;
  const allComplete =
    dateConfirmed &&
    (optionalParticipantIds.length === 0 || optionalComplete);
  const [confirmed, setConfirmed] = useState(false);
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [draftRoomId, setDraftRoomId] = useState(meeting.selectedRoomId);
  const stage: ResponseStage = confirmed
    ? "confirmed"
    : allComplete
      ? "allComplete"
      : optionalStarted
        ? "optionalCollecting"
        : dateConfirmed
          ? "dateConfirmed"
          : adjustmentRequested && adjustmentNeeded
            ? "adjustmentPending"
            : requiredComplete
              ? "requiredAggregating"
              : "requiredCollecting";

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setRequiredResponseCount(0);
      setOptionalResponseCount(0);
      setAdjustmentRequested(false);
      setAdjustmentResolved(false);
      setOptionalStarted(false);
      setConfirmed(false);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [meeting.attendeeIds, meeting.requiredAttendeeIds]);

  useEffect(() => {
    if (requiredResponseCount >= requiredParticipantIds.length) return undefined;

    const timer = window.setTimeout(() => {
      setRequiredResponseCount((current) =>
        Math.min(current + 1, requiredParticipantIds.length),
      );
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [requiredParticipantIds.length, requiredResponseCount]);

  useEffect(() => {
    if (!optionalStarted) return undefined;
    if (optionalResponseCount >= optionalParticipantIds.length) return undefined;

    const timer = window.setTimeout(() => {
      setOptionalResponseCount((current) =>
        Math.min(current + 1, optionalParticipantIds.length),
      );
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [optionalParticipantIds.length, optionalResponseCount, optionalStarted]);

  const followUpMessages = useMemo<FollowUpMessage[]>(() => {
    const messages: FollowUpMessage[] = [];

    respondedRequiredIds(requiredParticipantIds, requiredResponseCount).forEach(
      (id, index) => {
        const attendee = attendeeById(id);
        const response = responseProfile(id);
        const preferredSlot = slotById(response.preferredSlotId);
        const unavailableSlots = response.unavailableSlotIds
          .map(slotById)
          .map((slot) => slot.label)
          .join(", ");

        messages.push({
          id: `required-${id}`,
          author: "MFlow",
          initial: "M",
          time: `오전 10:${String(12 + index).padStart(2, "0")}`,
          message: `${attendee?.name ?? "필수 참석자"}님이 응답했습니다. 희망: ${preferredSlot.label}${unavailableSlots ? ` · 불가능: ${unavailableSlots}` : ""}`,
        });
      },
    );

    if (requiredComplete) {
      messages.push({
        id: "required-aggregate",
        author: "MFlow",
        initial: "M",
        time: "오전 10:18",
        message: adjustmentNeeded
          ? `필수 참석자 ${requiredParticipantIds.length}명 중 ${requiredAggregation.hopeIds.length}명이 ${requiredAggregation.selectedSlot.dateLabel}을 선택했어요. ${requiredAggregation.unavailableIds.map((id) => attendeeById(id)?.name).filter(Boolean).join(", ")}님의 일정 조정 확인이 필요해요.`
          : `필수 참석자 일정이 ${requiredAggregation.selectedSlot.dateLabel}로 1차 확정됐어요.`,
      });
    }

    if (adjustmentRequested) {
      messages.push({
        id: "adjustment-request",
        author: "MFlow",
        initial: "M",
        time: "오전 10:19",
        message: "일정 조정 요청을 보냈습니다.",
      });
    }

    if (adjustmentResolved) {
      messages.push({
        id: "adjustment-resolved",
        author: "MFlow",
        initial: "M",
        time: "오전 10:20",
        message: `필수 참석자 일정이 ${requiredAggregation.selectedSlot.dateLabel}로 1차 확정됐어요.`,
      });
    }

    if (optionalStarted) {
      messages.push({
        id: "optional-sent",
        author: "MFlow",
        initial: "M",
        time: "오전 10:21",
        message: `${requiredAggregation.selectedSlot.dateLabel} 중 가능한 시간을 선택해주세요.`,
      });
    }

    respondedOptionalIds(optionalParticipantIds, optionalResponseCount).forEach(
      (id, index) => {
        messages.push({
          id: `optional-${id}`,
          author: "MFlow",
          initial: "M",
          time: `오전 10:${String(22 + index).padStart(2, "0")}`,
          message: `${attendeeById(id)?.name ?? "선택 참석자"}님이 응답했습니다.`,
        });
      },
    );

    if (allComplete) {
      messages.push({
        id: "all-complete",
        author: "MFlow",
        initial: "M",
        time: "오전 10:28",
        message: "선택 참석자 응답을 반영해 최종 일정을 집계했습니다.",
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
  }, [
    adjustmentNeeded,
    adjustmentRequested,
    adjustmentResolved,
    allComplete,
    confirmedSchedule,
    optionalParticipantIds,
    optionalResponseCount,
    optionalStarted,
    requiredAggregation,
    requiredComplete,
    requiredParticipantIds,
    requiredResponseCount,
    retryMessage,
    stage,
  ]);

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
    if (optionalStarted || !dateConfirmed) return;
    setOptionalStarted(true);
  }

  function requestAdjustment() {
    if (adjustmentRequested) return;
    setAdjustmentRequested(true);
    window.setTimeout(() => {
      setAdjustmentResolved(true);
    }, 1000);
  }

  function retryRequest(id: string) {
    const target =
      id === "all" ? "미응답자" : `${attendeeById(id)?.name ?? "미응답자"}님`;

    setRetryMessage(`${target}에게 다시 요청을 보냈습니다.`);
  }

  function confirmMeeting() {
    if (!allComplete) return;
    if (
      meeting.locationType === "internal" &&
      !meeting.selectedRoomId &&
      !meeting.roomSelectionDeferred
    ) {
      setDraftRoomId("");
      setRoomModalOpen(true);
      return;
    }
    saveConfirmedSchedule(confirmedSchedule);
    setConfirmed(true);
    setReceivedRequestStatus("confirmed");
  }

  function completeRoomSelection(roomId: string) {
    const roomName = roomById(roomId)?.name ?? "회의실 미정";

    updateMeeting({
      roomSelectionDeferred: false,
      selectedRoomId: roomId,
    });
    setRoomModalOpen(false);
    saveConfirmedSchedule(
      getConfirmedScheduleInfo(
        meeting.title,
        requiredAggregation.selectedSlot,
        meeting.attendeeIds.length,
        roomName,
      ),
    );
    setConfirmed(true);
    setReceivedRequestStatus("confirmed");
  }

  function deferRoomSelection() {
    updateMeeting({
      roomSelectionDeferred: true,
      selectedRoomId: "",
    });
    setRoomModalOpen(false);
    saveConfirmedSchedule(
      getConfirmedScheduleInfo(
        meeting.title,
        requiredAggregation.selectedSlot,
        meeting.attendeeIds.length,
        "회의실 미정",
      ),
    );
    setConfirmed(true);
    setReceivedRequestStatus("confirmed");
  }

  function openRoomModal() {
    setDraftRoomId(meeting.selectedRoomId);
    setRoomModalOpen(true);
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
                adjustmentResolved={adjustmentResolved}
                aggregation={requiredAggregation}
                onConfirm={confirmMeeting}
                onRequestAdjustment={requestAdjustment}
                onSendOptional={sendOptionalRequests}
                optionalIds={optionalParticipantIds}
                optionalResponseCount={optionalResponseCount}
                optionalStarted={optionalStarted}
                requiredResponseCount={requiredResponseCount}
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
                adjustmentResolved={adjustmentResolved}
                attendeeIds={meeting.attendeeIds}
                onRetry={retryRequest}
                optionalIds={optionalParticipantIds}
                optionalResponseCount={optionalResponseCount}
                requiredResponseCount={requiredResponseCount}
                requiredIds={requiredParticipantIds}
                selectedSlotId={requiredAggregation.selectedSlot.id}
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
          adjustmentResolved={adjustmentResolved}
          attendeeIds={meeting.attendeeIds}
          confirmedSchedule={confirmedSchedule}
          onRequestAdjustment={requestAdjustment}
          onRetry={retryRequest}
          onSendOptional={sendOptionalRequests}
          onChangeRoom={openRoomModal}
          onViewSchedule={viewConfirmedSchedule}
          optionalIds={optionalParticipantIds}
          optionalResponseCount={optionalResponseCount}
          optionalStarted={optionalStarted}
          requiredResponseCount={requiredResponseCount}
          requiredIds={requiredParticipantIds}
          selectedSlotId={requiredAggregation.selectedSlot.id}
          stage={stage}
        />
      </div>
      {roomModalOpen ? (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#101828]/30 p-6">
          <section className="w-[440px] rounded-xl border border-[#E0E4EB] bg-white p-6 shadow-[0_20px_60px_rgba(16,24,40,0.16)]">
            <h2 className="text-lg font-bold leading-7 text-[#101828]">
              회의실 선택
            </h2>
            <p className="mt-2 text-sm font-medium leading-[21px] text-[#667085]">
              {confirmedSchedule.displayDateTime} · 참석 인원 {meeting.attendeeIds.length}명
            </p>
            <div className="mt-5 space-y-2">
              {meetingRooms.map((room) => {
                const disabled = room.capacity < meeting.attendeeIds.length;
                const selected = draftRoomId === room.id;

                return (
                  <button
                    className={cn(
                      "flex h-14 w-full items-center justify-between rounded-lg border px-4 text-left",
                      selected
                        ? "border-[#837CFF] bg-[#F7F6FF]"
                        : "border-[#E0E4EB] bg-[#F9FAFB]",
                      disabled && "cursor-not-allowed opacity-45",
                    )}
                    disabled={disabled}
                    key={room.id}
                    onClick={() => setDraftRoomId(room.id)}
                    type="button"
                  >
                    <span>
                      <span className="block text-sm font-bold leading-[21px] text-[#101828]">
                        {room.name} · {room.capacity}명
                      </span>
                      {disabled ? (
                        <span className="block text-xs font-medium leading-[18px] text-[#98A2B3]">
                          참석 인원보다 수용 인원이 적습니다.
                        </span>
                      ) : null}
                    </span>
                    <span
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full border",
                        selected
                          ? "border-[#837CFF] bg-[#837CFF] text-white"
                          : "border-[#D0D5DD] bg-white",
                      )}
                    >
                      {selected ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-2">
              <Button
                className="h-11 rounded-lg border border-[#D0D5DD] bg-white text-sm font-bold leading-[21px] text-[#475467] hover:bg-[#F9FAFB]"
                onClick={deferRoomSelection}
              >
                나중에 지정
              </Button>
              <Button
                className="h-11 rounded-lg bg-[#635BFF] text-sm font-bold leading-[21px] text-white hover:bg-[#635BFF]/90 disabled:bg-[#C9CED8] disabled:text-white"
                disabled={!draftRoomId}
                onClick={() => completeRoomSelection(draftRoomId)}
              >
                회의실 선택 완료
              </Button>
            </div>
          </section>
        </div>
      ) : null}
    </MeetFlowLayout>
  );
}
