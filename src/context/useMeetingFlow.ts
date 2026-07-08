import { useContext } from "react";
import { MeetingFlowContext } from "@/context/meetingFlowContextValue";

export function useMeetingFlow() {
  const context = useContext(MeetingFlowContext);

  if (!context) {
    throw new Error("useMeetingFlow must be used within MeetingFlowProvider");
  }

  return context;
}
