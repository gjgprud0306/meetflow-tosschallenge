import { formatDeadlineLabel } from "@/context/demoDates";
import { slotById } from "@/context/availabilityUtils";

export const participantRequestAnswersKey = "mflow-participant-request-answers";
export const participantRequestStatusKey = "mflow-participant-request-status";

export type ParticipantRequestAnswer = "preferred" | "available" | "unavailable";

export const participantRequest = {
  candidateDateLabel: slotById("slot-7-15-15").dateLabel,
  candidateTimes: [slotById("slot-7-15-15").label],
  deadline: formatDeadlineLabel(1, "18:00"),
  hostName: "윤지은",
  location: "MFlow 온라인 회의실",
  requiredAttendees: "허혜경, 김민서, 박준호, 윤서연",
  title: "리뷰회의",
};

export function getStoredParticipantRequestAnswers() {
  if (typeof window === "undefined") return null;

  const saved = window.localStorage.getItem(participantRequestAnswersKey);

  if (!saved) return null;

  try {
    const parsed = JSON.parse(saved) as Record<string, ParticipantRequestAnswer>;

    return Object.keys(parsed).length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

export function participantRequestAnswerLabel(answer: ParticipantRequestAnswer) {
  if (answer === "preferred") return "희망";
  if (answer === "available") return "가능";

  return "참석 어려움";
}

export function getParticipantRequestResponseLabel() {
  const answers = getStoredParticipantRequestAnswers();

  if (!answers) return "응답 필요";

  const values = Object.values(answers);

  if (values.includes("preferred")) return "희망";
  if (values.includes("available")) return "가능";

  return "참석 어려움";
}
