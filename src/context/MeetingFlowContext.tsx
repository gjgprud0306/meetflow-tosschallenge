import { useMemo, useState, type ReactNode } from "react";
import {
  MeetingFlowContext,
  type MeetingFlowContextValue,
  type ReceivedRequestStatus,
} from "@/context/meetingFlowContextValue";
import { createMeetingSummaries } from "@/context/meetingFlowUtils";
import { meetingCreateMock } from "@/mocks";
import type { MeetingCreateMock } from "@/types/meeting";

export function MeetingFlowProvider({ children }: { children: ReactNode }) {
  const [meeting, setMeeting] = useState<MeetingCreateMock>(meetingCreateMock);
  const [receivedRequestStatus, setReceivedRequestStatus] =
    useState<ReceivedRequestStatus>(() => {
      const saved = window.localStorage.getItem("mflow-participant-request-status");
      const savedAnswers = window.localStorage.getItem(
        "mflow-participant-request-answers",
      );

      if (saved === "confirmed") return saved;
      if (saved === "completed" && savedAnswers && savedAnswers !== "{}") {
        return saved;
      }

      return "pending";
    });

  const value = useMemo<MeetingFlowContextValue>(
    () => ({
      meeting,
      receivedRequestStatus,
      setReceivedRequestStatus: (nextStatus) => {
        setReceivedRequestStatus((current) => {
          const value =
            typeof nextStatus === "function" ? nextStatus(current) : nextStatus;

          window.localStorage.setItem("mflow-participant-request-status", value);

          return value;
        });
      },
      setMeeting,
      updateMeeting: (patch) => {
        setMeeting((current) => ({ ...current, ...patch }));
      },
      summaries: createMeetingSummaries(meeting),
    }),
    [meeting, receivedRequestStatus],
  );

  return (
    <MeetingFlowContext.Provider value={value}>
      {children}
    </MeetingFlowContext.Provider>
  );
}
