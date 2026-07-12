import { useNavigate } from "react-router-dom";
import { MeetFlowLayout } from "@/components/MeetFlowLayout";
import { Button } from "@/components/ui/button";
import { slotById } from "@/context/availabilityUtils";
import { useMeetingFlow } from "@/context/useMeetingFlow";

export function ReceivedRequestsPage() {
  const navigate = useNavigate();
  const { receivedRequestStatus } = useMeetingFlow();
  const confirmed = receivedRequestStatus === "confirmed";
  const candidateSlot = slotById("slot-7-15-15");

  return (
    <MeetFlowLayout title="받은 요청">
      <div className="h-full w-full overflow-y-auto px-8 pt-7">
        <p className="text-sm font-medium leading-[21px] text-[#667085]">
          초대받은 회의의 후보 시간을 확인하고 응답해주세요.
        </p>

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
              <span
                className={
                  confirmed
                    ? "rounded-full bg-[#F2F4F7] px-3 py-1 text-xs font-bold leading-[18px] text-[#667085]"
                    : "rounded-full bg-[#F7F6FF] px-3 py-1 text-xs font-bold leading-[18px] text-[#837CFF]"
                }
              >
                {confirmed ? "확정됨" : "응답 완료"}
              </span>
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
              <div className="flex gap-6">
                <span className="w-[72px] shrink-0 text-[#98A2B3]">응답 상태</span>
                <span className="text-[#475467]">
                  {confirmed ? "확정됨" : "응답 완료"}
                </span>
              </div>
              <div className="flex gap-6">
                <span className="w-[72px] shrink-0 text-[#98A2B3]">내 응답</span>
                <span className="font-bold text-[#635BFF]">희망</span>
              </div>
              <div className="flex gap-6">
                <span className="w-[72px] shrink-0 text-[#98A2B3]">예상 시간</span>
                <span className="text-[#475467]">1시간</span>
              </div>
              <div className="flex gap-6">
                <span className="w-[72px] shrink-0 text-[#98A2B3]">장소</span>
                <span className="text-[#475467]">MFlow 온라인 회의실</span>
              </div>
              <div className="flex gap-6">
                <span className="w-[72px] shrink-0 text-[#98A2B3]">응답 마감</span>
                <span className="text-[#475467]">7/14(화) 18:00</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-[#E0E4EB] p-5">
                <Button
                  className="h-12 rounded-lg bg-[#ECEBFF] text-base font-bold leading-6 text-[#837CFF] hover:bg-[#E4E2FF]"
                  onClick={() => navigate("/requests/candidate-select")}
                >
                  응답 수정
                </Button>
                <Button
                  className="h-12 rounded-lg bg-[#635BFF] text-base font-bold leading-6 text-white hover:bg-[#635BFF]/90"
                  onClick={() => navigate("/my-schedule?highlight=received-review-meeting")}
                >
                  일정 보기
                </Button>
            </div>
          </article>
        </div>
      </div>
    </MeetFlowLayout>
  );
}
