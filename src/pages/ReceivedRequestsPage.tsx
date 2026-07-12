import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MeetFlowLayout } from "@/components/MeetFlowLayout";
import { Button } from "@/components/ui/button";
import { slotById } from "@/context/availabilityUtils";
import { useMeetingFlow } from "@/context/useMeetingFlow";
import {
  getStoredParticipantRequestAnswers,
  participantRequestAnswersKey,
  participantRequestStatusKey,
  participantRequest,
  participantRequestAnswerLabel,
} from "@/mocks/participantRequest";

export function ReceivedRequestsPage() {
  const navigate = useNavigate();
  const { receivedRequestStatus, setReceivedRequestStatus } = useMeetingFlow();
  const responseAnswers = getStoredParticipantRequestAnswers();
  const finalResponse = useMemo(() => {
    const responseValues = responseAnswers ? Object.values(responseAnswers) : [];

    if (responseValues.includes("preferred")) return "preferred";
    if (responseValues.includes("available")) return "available";
    if (responseValues.includes("unavailable")) return "unavailable";

    return null;
  }, [responseAnswers]);
  const hasResponse = Boolean(finalResponse);
  const confirmed = receivedRequestStatus === "confirmed";
  const candidateSlot = slotById(participantRequest.confirmationSlotId);
  const confirmationTime = candidateSlot.timeLabel.split("–")[0];
  const confirmationRequestActive =
    receivedRequestStatus === "pending" && !confirmed && !hasResponse;
  const [showConfirmationToast, setShowConfirmationToast] = useState(() => {
    if (!confirmationRequestActive) return false;

    return window.sessionStorage.getItem("mflow-confirmation-request-toast") !== "seen";
  });

  useEffect(() => {
    if (!showConfirmationToast) return;

    window.sessionStorage.setItem("mflow-confirmation-request-toast", "seen");
  }, [showConfirmationToast]);

  function confirmAvailability() {
    window.localStorage.setItem(
      participantRequestAnswersKey,
      JSON.stringify({ "candidate-1": "available" }),
    );
    window.localStorage.setItem(participantRequestStatusKey, "completed");
    setShowConfirmationToast(false);
    setReceivedRequestStatus("completed");
    navigate("/requests/received");
  }

  return (
    <MeetFlowLayout title="받은 요청">
      <div className="h-full w-full overflow-y-auto px-8 pt-7">
        <p className="text-sm font-medium leading-[21px] text-[#667085]">
          초대받은 회의의 후보 시간을 확인하고 응답해주세요.
        </p>
        {showConfirmationToast && confirmationRequestActive ? (
          <div className="mt-4 flex w-full max-w-[680px] items-center justify-between rounded-lg border border-[#D8D5F7] bg-[#F7F6FF] px-4 py-3">
            <p className="text-sm font-bold leading-[21px] text-[#635BFF]">
              현재 필수 참석자 {participantRequest.requiredTotalCount}명 중{" "}
              {participantRequest.majorityCount}명이 {candidateSlot.dateLabel}{" "}
              {confirmationTime}를 선택했어요. 이 시간 괜찮으신가요?
            </p>
            <button
              className="ml-4 shrink-0 text-xs font-bold leading-[18px] text-[#667085]"
              onClick={() => setShowConfirmationToast(false)}
              type="button"
            >
              닫기
            </button>
          </div>
        ) : null}

        <div className="mt-8 flex w-full flex-col gap-4">
          <article className="w-full max-w-[680px] overflow-hidden rounded-xl border border-[#E0E4EB] bg-white shadow-[0_4px_16px_rgba(16,24,40,0.06)]">
            <div className="flex h-[72px] items-center justify-between bg-[#F7F6FF] px-5">
              <div>
                <h2 className="text-lg font-bold leading-7 text-[#101828]">
                  리뷰회의
                </h2>
                <p className="mt-1 text-sm font-medium leading-[21px] text-[#475467]">
                  윤지은님이 보낸 회의 요청
                </p>
              </div>
              {confirmed ? (
                <span className="rounded-full bg-[#F2F4F7] px-3 py-1 text-xs font-bold leading-[18px] text-[#667085]">
                  확정됨
                </span>
              ) : hasResponse ? (
                <span className="rounded-full bg-[#F7F6FF] px-3 py-1 text-xs font-bold leading-[18px] text-[#837CFF]">
                  응답 완료
                </span>
              ) : confirmationRequestActive ? (
                <span className="rounded-full bg-[#F7F6FF] px-3 py-1 text-xs font-bold leading-[18px] text-[#837CFF]">
                  확정 가능 여부 확인
                </span>
              ) : null}
            </div>

            <div className="space-y-3 px-5 py-5 text-sm font-medium leading-[21px]">
              <div className="flex gap-6">
                <span className="w-[72px] shrink-0 text-[#98A2B3]">내 역할</span>
                <span className="inline-flex rounded-full bg-[#F0EEFF] px-3 py-1 text-xs font-bold leading-[18px] text-[#635BFF]">
                  필수 참석자
                </span>
              </div>
              <div className="flex gap-6">
                <span className="w-[72px] shrink-0 text-[#98A2B3]">후보 일정</span>
                <span className="text-[#475467]">{candidateSlot.label}</span>
              </div>
              {confirmationRequestActive ? (
                <div className="flex gap-6">
                  <span className="w-[72px] shrink-0 text-[#98A2B3]">안내</span>
                  <span className="text-[#475467]">
                    현재 필수 참석자 {participantRequest.requiredTotalCount}명 중{" "}
                    {participantRequest.majorityCount}명이 {candidateSlot.dateLabel}{" "}
                    {confirmationTime}를 선택했어요. 이 시간 괜찮으신가요?
                  </span>
                </div>
              ) : null}
              <div className="flex gap-6">
                <span className="w-[72px] shrink-0 text-[#98A2B3]">응답 상태</span>
                <span className="text-[#475467]">
                  {confirmed
                    ? "확정됨"
                    : hasResponse
                      ? "응답 완료"
                      : confirmationRequestActive
                        ? "확정 가능 여부 확인"
                        : "미응답"}
                </span>
              </div>
              {finalResponse ? (
                <div className="flex gap-6">
                <span className="w-[72px] shrink-0 text-[#98A2B3]">내 응답</span>
                <span className="font-bold text-[#635BFF]">
                    {participantRequestAnswerLabel(finalResponse)}
                </span>
              </div>
              ) : null}
              <div className="flex gap-6">
                <span className="w-[72px] shrink-0 text-[#98A2B3]">예상 시간</span>
                <span className="text-[#475467]">1시간</span>
              </div>
              <div className="flex gap-6">
                <span className="w-[72px] shrink-0 text-[#98A2B3]">장소</span>
                <span className="text-[#475467]">{participantRequest.location}</span>
              </div>
              {!confirmed ? (
                <div className="flex gap-6">
                  <span className="w-[72px] shrink-0 text-[#98A2B3]">응답 마감</span>
                  <span className="text-[#475467]">{participantRequest.deadline}</span>
                </div>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-[#E0E4EB] p-5">
              {confirmed ? (
                <Button
                  className="col-span-2 h-12 rounded-lg bg-[#635BFF] text-base font-bold leading-6 text-white hover:bg-[#635BFF]/90"
                  onClick={() => navigate("/meetings/detail")}
                >
                  확정 일정 보기
                </Button>
              ) : (
                <>
                  <Button
                    className={
                      hasResponse
                        ? "h-12 rounded-lg bg-[#ECEBFF] text-base font-bold leading-6 text-[#837CFF] hover:bg-[#E4E2FF]"
                        : "h-12 rounded-lg bg-[#635BFF] text-base font-bold leading-6 text-white hover:bg-[#635BFF]/90"
                    }
                    onClick={
                      confirmationRequestActive
                        ? confirmAvailability
                        : () => navigate("/requests/candidate-select")
                    }
                  >
                    {hasResponse
                      ? "응답 수정"
                      : confirmationRequestActive
                        ? "네, 가능해요"
                        : "응답하기"}
                  </Button>
                <Button
                  className={
                    hasResponse
                      ? "h-12 rounded-lg bg-[#635BFF] text-base font-bold leading-6 text-white hover:bg-[#635BFF]/90"
                      : "h-12 rounded-lg bg-[#ECEBFF] text-base font-bold leading-6 text-[#837CFF] hover:bg-[#E4E2FF]"
                  }
                  disabled={confirmed}
                  onClick={
                    confirmationRequestActive
                      ? () => navigate("/requests/candidate-select")
                      : () => navigate("/my-schedule?highlight=received-review-meeting")
                  }
                >
                  {confirmationRequestActive ? "다른 시간 제안" : "일정 보기"}
                </Button>
              </>
              )}
            </div>
          </article>
        </div>
      </div>
    </MeetFlowLayout>
  );
}
