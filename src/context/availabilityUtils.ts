import { attendees } from "@/mocks/attendees";
import {
  demoDate,
  formatLongDate,
  formatScheduleLine,
  formatScheduleMeta,
  formatShortDate,
  formatSlotLabel,
} from "@/context/demoDates";
import type { MeetingCreateMock } from "@/types/meeting";

export type AvailabilitySlot = {
  id: string;
  dateLabel: string;
  shortDateLabel: string;
  timeLabel: string;
  label: string;
  availableIds: string[];
  unavailableIds: string[];
  preferredCount: number;
};

export type AvailabilityStatusTone =
  | "recommended"
  | "all"
  | "required"
  | "disabled";

export type AvailabilityStatus = {
  label: string;
  tone: AvailabilityStatusTone;
};

export type RecommendationCardData = {
  badge: string;
  description: string;
  emphasis: boolean;
  id: string;
  kind: "all" | "partialOptional" | "requiredOnly";
  slot: AvailabilitySlot;
};

export type CalendarScheduleCard = {
  category?: "회의" | "외근" | "휴가" | "개인";
  id?: string;
  meta: string;
  source?: "manual" | "confirmed" | "coordinating";
  status: string;
  title: string;
};

export const ownerCalendarSchedules: CalendarScheduleCard[] = [
  {
    category: "회의",
    id: "owner-weekly-work-meeting",
    meta: formatScheduleMeta(0, "09:00–10:00"),
    status: "회의",
    title: "주간 업무 회의",
  },
  {
    category: "회의",
    id: "owner-project-sync",
    meta: formatScheduleMeta(1, "10:00–11:00"),
    status: "회의",
    title: "프로젝트 진행 상황 공유",
  },
  {
    category: "회의",
    id: "owner-leader-meeting",
    meta: formatScheduleMeta(2, "13:00–14:00"),
    status: "회의",
    title: "리더 미팅",
  },
  {
    category: "회의",
    id: "owner-dev-schedule-check",
    meta: formatScheduleMeta(3, "15:00–16:00"),
    status: "회의",
    title: "개발 일정 점검",
  },
  {
    category: "회의",
    id: "owner-retrospective",
    meta: formatScheduleMeta(4, "10:00–11:00"),
    status: "회의",
    title: "회고 회의",
  },
];

export const receivedReviewMeetingCalendarSchedule: CalendarScheduleCard = {
  category: "회의",
  id: "received-review-meeting",
  meta: `${formatScheduleMeta(2, "15:00–16:00")} · 허혜경 역할: 필수 참석자 · 응답 필요`,
  source: "coordinating",
  status: "조율 중",
  title: "리뷰회의",
};

export const teamRegisteredSchedules = [
  {
    attendeeId: "owner",
    name: "허혜경",
    schedules: [
      formatScheduleLine(0, "09:00~10:00", "주간 업무 회의"),
      formatScheduleLine(1, "10:00~11:00", "프로젝트 진행 상황 공유"),
      formatScheduleLine(2, "13:00~14:00", "리더 미팅"),
      formatScheduleLine(3, "15:00~16:00", "개발 일정 점검"),
      formatScheduleLine(4, "10:00~11:00", "회고 회의"),
    ],
  },
  {
    attendeeId: "min",
    name: "김민서",
    schedules: [
      formatScheduleLine(0, "14:00~15:00", "디자인 리뷰"),
      formatScheduleLine(1, "11:00~12:00", "화면 설계 회의"),
      formatScheduleLine(2, "10:00~11:00", "디자인 시스템 점검"),
      formatScheduleLine(3, "13:00~14:00", "개발 협업 회의"),
      formatScheduleLine(4, "11:00~12:00", "사용자 테스트 정리"),
    ],
  },
  {
    attendeeId: "jun",
    name: "박준호",
    schedules: [
      formatScheduleLine(0, "13:00~14:00", "개발 스프린트 회의"),
      formatScheduleLine(1, "09:00~10:00", "코드 리뷰"),
      formatScheduleLine(2, "11:00~12:00", "서버 연동 점검"),
      formatScheduleLine(3, "14:00~15:00", "QA 이슈 확인"),
      formatScheduleLine(4, "10:00~11:00", "배포 준비 회의"),
    ],
  },
  {
    attendeeId: "seo",
    name: "윤서연",
    schedules: [
      formatScheduleLine(0, "10:30~12:00", "캠페인 기획 회의"),
      formatScheduleLine(1, "13:30~15:30", "마케팅 성과 리뷰"),
      formatScheduleLine(2, "10:00~11:00", "광고 소재 검토"),
      formatScheduleLine(3, "14:00~15:00", "콘텐츠 일정 회의"),
      formatScheduleLine(4, "11:00~12:00", "채널 운영 회의"),
    ],
  },
  {
    attendeeId: "ji",
    name: "윤지은",
    schedules: [
      formatScheduleLine(0, "10:00~12:00", "주간 대시보드 정리"),
      formatScheduleLine(1, "13:00~15:00", "사용자 데이터 분석"),
      formatScheduleLine(2, "09:00~10:00", "데이터팀 회의"),
      formatScheduleLine(3, "11:00~12:00", "지표 정의 회의"),
      formatScheduleLine(4, "10:00~11:00", "리포트 작성 회의"),
    ],
  },
  {
    attendeeId: "eun",
    name: "박은주",
    schedules: [
      formatScheduleLine(0, "10:30~12:00", "콘텐츠 촬영"),
      formatScheduleLine(1, "10:00~11:00", "콘텐츠 기획 회의"),
      formatScheduleLine(2, "13:00~14:00", "이미지 제작 회의"),
      formatScheduleLine(3, "15:00~16:00", "브랜드 디자인 검토"),
      formatScheduleLine(4, "11:00~12:00", "콘텐츠 결과 공유"),
    ],
  },
];

export const baseAvailabilitySlots: AvailabilitySlot[] = [
  {
    id: "slot-7-13-11",
    dateLabel: formatLongDate(demoDate(0)),
    shortDateLabel: formatShortDate(demoDate(0), true),
    timeLabel: "11:00–12:00",
    label: formatSlotLabel(0, "11:00–12:00"),
    availableIds: ["owner", "min", "jun"],
    unavailableIds: ["seo", "ji", "eun"],
    preferredCount: 1,
  },
  {
    id: "slot-7-14-14",
    dateLabel: formatLongDate(demoDate(1)),
    shortDateLabel: formatShortDate(demoDate(1), true),
    timeLabel: "14:00–15:00",
    label: formatSlotLabel(1, "14:00–15:00"),
    availableIds: ["owner", "min", "jun", "eun"],
    unavailableIds: ["seo", "ji"],
    preferredCount: 2,
  },
  {
    id: "slot-7-15-15",
    dateLabel: formatLongDate(demoDate(2)),
    shortDateLabel: formatShortDate(demoDate(2), true),
    timeLabel: "15:00–16:00",
    label: formatSlotLabel(2, "15:00–16:00"),
    availableIds: ["owner", "min", "jun", "seo", "ji", "eun"],
    unavailableIds: [],
    preferredCount: 3,
  },
  {
    id: "slot-7-16-10",
    dateLabel: formatLongDate(demoDate(3)),
    shortDateLabel: formatShortDate(demoDate(3), true),
    timeLabel: "10:00–11:00",
    label: formatSlotLabel(3, "10:00–11:00"),
    availableIds: ["owner", "min", "jun", "seo", "ji", "eun"],
    unavailableIds: [],
    preferredCount: 2,
  },
  {
    id: "slot-7-17-14",
    dateLabel: formatLongDate(demoDate(4)),
    shortDateLabel: formatShortDate(demoDate(4), true),
    timeLabel: "14:00–15:00",
    label: formatSlotLabel(4, "14:00–15:00"),
    availableIds: ["owner", "min", "jun", "seo", "ji", "eun"],
    unavailableIds: [],
    preferredCount: 1,
  },
];

export function attendeeName(id: string) {
  return attendees.find((attendee) => attendee.id === id)?.name ?? "";
}

export function slotById(id: string) {
  return baseAvailabilitySlots.find((slot) => slot.id === id) ?? baseAvailabilitySlots[2];
}

export function getParticipantGroups(meeting: MeetingCreateMock) {
  const attendeeIds = meeting.attendeeIds;
  const requiredIds = attendeeIds.filter((id) =>
    meeting.requiredAttendeeIds.includes(id),
  );
  const optionalIds = attendeeIds.filter(
    (id) => !meeting.requiredAttendeeIds.includes(id),
  );

  return { attendeeIds, optionalIds, requiredIds };
}

export function getEligibleAvailabilitySlots(meeting: MeetingCreateMock) {
  const { attendeeIds, requiredIds } = getParticipantGroups(meeting);

  return baseAvailabilitySlots
    .map((slot) => {
      const availableIds = slot.availableIds.filter((id) => attendeeIds.includes(id));
      const unavailableIds = attendeeIds.filter((id) => !availableIds.includes(id));

      return {
        ...slot,
        availableIds,
        unavailableIds,
      };
    })
    .filter((slot) => requiredIds.every((id) => slot.availableIds.includes(id)))
    .sort((a, b) => {
      if (b.availableIds.length !== a.availableIds.length) {
        return b.availableIds.length - a.availableIds.length;
      }

      return baseAvailabilitySlots.findIndex((slot) => slot.id === a.id) -
        baseAvailabilitySlots.findIndex((slot) => slot.id === b.id);
    });
}

export function getChronologicalEligibleSlots(meeting: MeetingCreateMock) {
  const eligibleIds = new Set(
    getEligibleAvailabilitySlots(meeting).map((slot) => slot.id),
  );

  return baseAvailabilitySlots.filter((slot) => eligibleIds.has(slot.id)).map((slot) => {
    const { attendeeIds } = getParticipantGroups(meeting);
    const availableIds = slot.availableIds.filter((id) => attendeeIds.includes(id));

    return {
      ...slot,
      availableIds,
      unavailableIds: attendeeIds.filter((id) => !availableIds.includes(id)),
    };
  });
}

export function getAvailabilityStatus(
  slot: AvailabilitySlot | undefined,
  meeting: MeetingCreateMock,
): AvailabilityStatus {
  if (!slot) return { label: "선택 불가", tone: "disabled" };

  const { attendeeIds, optionalIds } = getParticipantGroups(meeting);
  const optionalAvailable = optionalIds.filter((id) =>
    slot.availableIds.includes(id),
  ).length;

  if (slot.availableIds.length === attendeeIds.length) {
    const firstAll = getEligibleAvailabilitySlots(meeting).find(
      (item) => item.availableIds.length === attendeeIds.length,
    );

    return firstAll?.id === slot.id
      ? { label: "추천", tone: "recommended" }
      : { label: "전원 가능", tone: "all" };
  }

  return {
    label: optionalAvailable > 0 ? "선택 일부 가능" : "필수 전원 가능",
    tone: "required",
  };
}

function makeDescription(
  kind: RecommendationCardData["kind"],
  requiredCount: number,
  optionalAvailableCount: number,
  totalCount: number,
) {
  if (kind === "all") {
    return `${totalCount}명 모두 참석할 수 있는 일정이에요.`;
  }

  if (kind === "partialOptional") {
    return `필수 참석자 ${requiredCount}명과 선택 참석자 ${optionalAvailableCount}명이 가능한 가장 빠른 일정이에요.`;
  }

  return `필수 참석자가 모두 가능한 가장 빠른 일정이에요.`;
}

export function getRecommendationCards(meeting: MeetingCreateMock) {
  const { attendeeIds, optionalIds, requiredIds } = getParticipantGroups(meeting);
  const chronologicalSlots = getChronologicalEligibleSlots(meeting);
  const totalCount = attendeeIds.length;

  return chronologicalSlots.slice(0, 3).map((slot, index) => {
    const optionalAvailableCount = optionalIds.filter((id) =>
      slot.availableIds.includes(id),
    ).length;
    const allAvailable = slot.availableIds.length === totalCount;
    const kind: RecommendationCardData["kind"] = allAvailable
      ? "all"
      : optionalAvailableCount > 0
        ? "partialOptional"
        : "requiredOnly";

    return {
      badge:
        index === 0
          ? "추천 1 · 가장 추천"
          : allAvailable
            ? `추천 ${index + 1} · 전원 가능`
            : `추천 ${index + 1}`,
      description: makeDescription(
        kind,
        requiredIds.length,
        optionalAvailableCount,
        totalCount,
      ),
      emphasis: index === 0,
      id: `${kind}-${slot.id}`,
      kind,
      slot,
    };
  });
}

export function getAdditionalAllAvailableSlots(meeting: MeetingCreateMock) {
  const primaryCardIds = new Set(
    getRecommendationCards(meeting).map((card) => card.slot.id),
  );
  const { attendeeIds } = getParticipantGroups(meeting);

  return getChronologicalEligibleSlots(meeting).filter(
    (slot) =>
      slot.availableIds.length === attendeeIds.length && !primaryCardIds.has(slot.id),
  );
}
