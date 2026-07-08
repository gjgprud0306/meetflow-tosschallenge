import { useMemo, useState, type ReactNode } from "react";
import { MeetingFlowContext, type MeetingFlowContextValue } from "@/context/meetingFlowContextValue";
import { createMeetingSummaries } from "@/context/meetingFlowUtils";
import { meetingCreateMock } from "@/mocks";
import type { MeetingCreateMock } from "@/types/meeting";

export function MeetingFlowProvider({ children }: { children: ReactNode }) {
  const [meeting, setMeeting] = useState<MeetingCreateMock>(meetingCreateMock);

  const value = useMemo<MeetingFlowContextValue>(
    () => ({
      meeting,
      setMeeting,
      updateMeeting: (patch) => {
        setMeeting((current) => ({ ...current, ...patch }));
      },
      summaries: createMeetingSummaries(meeting),
    }),
    [meeting],
  );

  return (
    <MeetingFlowContext.Provider value={value}>
      {children}
    </MeetingFlowContext.Provider>
  );
}
