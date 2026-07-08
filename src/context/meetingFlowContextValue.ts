import { createContext } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { MeetingCreateMock } from "@/types/meeting";

export type MeetingFlowContextValue = {
  meeting: MeetingCreateMock;
  updateMeeting: (patch: Partial<MeetingCreateMock>) => void;
  setMeeting: Dispatch<SetStateAction<MeetingCreateMock>>;
  summaries: {
    attendeesLabel: string;
    requiredLabel: string;
    dateRange: string;
    timeCount: string;
    selectedTimes: string;
    deadline: string;
    reminder: string;
    reminderText: string;
  };
};

export const MeetingFlowContext =
  createContext<MeetingFlowContextValue | null>(null);
