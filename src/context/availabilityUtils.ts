import { attendees } from "@/mocks";
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

export const teamRegisteredSchedules = [
  {
    attendeeId: "owner",
    name: "허혜경",
    schedules: [
      "7/13(월) 09:00~10:00 주간 업무 회의",
      "7/14(화) 10:00~11:00 프로젝트 진행 상황 공유",
      "7/15(수) 13:00~14:00 리더 미팅",
      "7/16(목) 15:00~16:00 개발 일정 점검",
      "7/17(금) 10:00~11:00 회고 회의",
    ],
  },
  {
    attendeeId: "min",
    name: "김민서",
    schedules: [
      "7/13(월) 14:00~15:00 디자인 리뷰",
      "7/14(화) 11:00~12:00 화면 설계 회의",
      "7/15(수) 10:00~11:00 디자인 시스템 점검",
      "7/16(목) 13:00~14:00 개발 협업 회의",
      "7/17(금) 11:00~12:00 사용자 테스트 정리",
    ],
  },
  {
    attendeeId: "jun",
    name: "박준호",
    schedules: [
      "7/13(월) 13:00~14:00 개발 스프린트 회의",
      "7/14(화) 09:00~10:00 코드 리뷰",
      "7/15(수) 11:00~12:00 서버 연동 점검",
      "7/16(목) 14:00~15:00 QA 이슈 확인",
      "7/17(금) 10:00~11:00 배포 준비 회의",
    ],
  },
  {
    attendeeId: "seo",
    name: "윤서연",
    schedules: [
      "7/13(월) 10:30~12:00 캠페인 기획 회의",
      "7/14(화) 13:30~15:30 마케팅 성과 리뷰",
      "7/15(수) 10:00~11:00 광고 소재 검토",
      "7/16(목) 14:00~15:00 콘텐츠 일정 회의",
      "7/17(금) 11:00~12:00 채널 운영 회의",
    ],
  },
  {
    attendeeId: "ji",
    name: "윤지은",
    schedules: [
      "7/13(월) 10:00~12:00 주간 대시보드 정리",
      "7/14(화) 13:00~15:00 사용자 데이터 분석",
      "7/15(수) 09:00~10:00 데이터팀 회의",
      "7/16(목) 11:00~12:00 지표 정의 회의",
      "7/17(금) 10:00~11:00 리포트 작성 회의",
    ],
  },
  {
    attendeeId: "eun",
    name: "박은주",
    schedules: [
      "7/13(월) 10:30~12:00 콘텐츠 촬영",
      "7/14(화) 10:00~11:00 콘텐츠 기획 회의",
      "7/15(수) 13:00~14:00 이미지 제작 회의",
      "7/16(목) 15:00~16:00 브랜드 디자인 검토",
      "7/17(금) 11:00~12:00 콘텐츠 결과 공유",
    ],
  },
];

export const baseAvailabilitySlots: AvailabilitySlot[] = [
  {
    id: "slot-7-13-11",
    dateLabel: "7월 13일 월요일",
    shortDateLabel: "7/13 (월)",
    timeLabel: "11:00–12:00",
    label: "7월 13일 월요일 11:00–12:00",
    availableIds: ["owner", "min", "jun"],
    unavailableIds: ["seo", "ji", "eun"],
    preferredCount: 1,
  },
  {
    id: "slot-7-14-14",
    dateLabel: "7월 14일 화요일",
    shortDateLabel: "7/14 (화)",
    timeLabel: "14:00–15:00",
    label: "7월 14일 화요일 14:00–15:00",
    availableIds: ["owner", "min", "jun", "eun"],
    unavailableIds: ["seo", "ji"],
    preferredCount: 2,
  },
  {
    id: "slot-7-15-15",
    dateLabel: "7월 15일 수요일",
    shortDateLabel: "7/15 (수)",
    timeLabel: "15:00–16:00",
    label: "7월 15일 수요일 15:00–16:00",
    availableIds: ["owner", "min", "jun", "seo", "ji", "eun"],
    unavailableIds: [],
    preferredCount: 3,
  },
  {
    id: "slot-7-16-10",
    dateLabel: "7월 16일 목요일",
    shortDateLabel: "7/16 (목)",
    timeLabel: "10:00–11:00",
    label: "7월 16일 목요일 10:00–11:00",
    availableIds: ["owner", "min", "jun", "seo", "ji", "eun"],
    unavailableIds: [],
    preferredCount: 2,
  },
  {
    id: "slot-7-17-14",
    dateLabel: "7월 17일 금요일",
    shortDateLabel: "7/17 (금)",
    timeLabel: "14:00–15:00",
    label: "7월 17일 금요일 14:00–15:00",
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
    return `${totalCount}명 모두 참석할 수 있는 가장 빠른 일정이에요.`;
  }

  if (kind === "partialOptional") {
    return `필수 참석자 ${requiredCount}명과 선택 참석자 ${optionalAvailableCount}명이 가능한 가장 빠른 일정이에요.`;
  }

  return `필수 참석자 ${requiredCount}명 모두가 가능한 가장 빠른 일정이에요.`;
}

export function getRecommendationCards(meeting: MeetingCreateMock) {
  const { attendeeIds, optionalIds, requiredIds } = getParticipantGroups(meeting);
  const chronologicalSlots = getChronologicalEligibleSlots(meeting);
  const used = new Set<string>();
  const cards: RecommendationCardData[] = [];
  const totalCount = attendeeIds.length;

  function pushCard(kind: RecommendationCardData["kind"], badge: string, emphasis = false) {
    const slot = chronologicalSlots.find((item) => {
      if (used.has(item.id)) return false;
      const optionalAvailableCount = optionalIds.filter((id) =>
        item.availableIds.includes(id),
      ).length;

      if (kind === "all") return item.availableIds.length === totalCount;
      if (kind === "partialOptional") {
        return optionalAvailableCount > 0 && item.availableIds.length < totalCount;
      }

      return optionalAvailableCount === 0;
    });

    if (!slot) return;

    used.add(slot.id);

    const optionalAvailableCount = optionalIds.filter((id) =>
      slot.availableIds.includes(id),
    ).length;

    cards.push({
      badge,
      description: makeDescription(
        kind,
        requiredIds.length,
        optionalAvailableCount,
        totalCount,
      ),
      emphasis,
      id: `${kind}-${slot.id}`,
      kind,
      slot,
    });
  }

  pushCard("all", "추천 1 · 전원 참석 가능", true);

  if (optionalIds.length > 0) {
    pushCard("partialOptional", `추천 ${cards.length + 1} · 선택 참석자 일부 가능`);
    pushCard("requiredOnly", `추천 ${cards.length + 1} · 필수 참석자 우선`);
  }

  return cards;
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
