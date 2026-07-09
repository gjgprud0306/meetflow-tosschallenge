import { Check } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AvatarBadge } from "@/components/AvatarBadge";
import { MeetFlowLayout } from "@/components/MeetFlowLayout";
import { Button } from "@/components/ui/button";
import { useMeetingFlow } from "@/context/useMeetingFlow";
import { cn } from "@/lib/utils";

type CandidateAnswer = "available" | "unavailable";

const candidateOptions = [
  { id: "candidate-1", label: "7/9(수) 11:00" },
  { id: "candidate-2", label: "7/10(금) 10:00" },
  { id: "candidate-3", label: "7/10(금) 15:00" },
];

export function MeetingCandidateSelectPage() {
  const { meeting } = useMeetingFlow();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<string, CandidateAnswer>>({});

  function selectAnswer(optionId: string, answer: CandidateAnswer) {
    setAnswers((current) => ({ ...current, [optionId]: answer }));
  }

  return (
    <MeetFlowLayout>
      <div className="relative h-full w-full bg-white">
        <div className="h-full w-full overflow-y-auto pl-0 pr-8 pb-[132px] pt-7">
          <div className="flex flex-col gap-6">
            <div className="space-y-6">
              <article className="flex items-start">
                <AvatarBadge initial="M" />
                <div className="ml-3">
                  <div className="flex h-[21px] items-center gap-1.5">
                    <span className="text-sm font-bold leading-[21px] text-[#101828]">
                      MFlow
                    </span>
                    <span className="text-xs font-normal leading-[18px] text-[#98A2B3]">
                      오전 10:12
                    </span>
                  </div>
                  <p className="mt-1 text-base font-normal leading-6 text-[#1D2939]">
                    입력한 일정과 주최자가 제안한 후보 시간을 비교하여 가능 여부를
                    선택하세요.
                  </p>
                </div>
              </article>
            </div>

            <section className="w-full max-w-[880px] overflow-hidden rounded-xl border border-[#E0E4EB] bg-white shadow-[0_4px_16px_rgba(16,24,40,0.08)]">
              <div className="flex h-[74px] items-center bg-[#F0EFFF] px-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#635BFF] text-xl font-bold leading-[30px] text-white">
                  15
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-bold leading-7 text-[#101828]">
                    {meeting.title || "회의"}
                  </h2>
                  <p className="mt-1 text-sm font-medium leading-[21px] text-[#475467]">
                    입력한 일정과 후보 시간을 비교 후 제출
                  </p>
                </div>
              </div>

              <div className="grid h-[84px] grid-cols-[1fr_112px_1fr] border-b border-[#E0E4EB]">
                <div className="flex flex-col justify-center px-6">
                  <span className="text-sm font-bold leading-[21px] text-[#98A2B3]">
                    내 응답
                  </span>
                  <span className="mt-2 text-sm font-medium leading-[21px] text-[#98A2B3]">
                    아직 응답이 없습니다
                  </span>
                </div>
                <div className="flex flex-col justify-center border-x border-[#E0E4EB] px-6">
                  <span className="text-sm font-bold leading-[21px] text-[#98A2B3]">
                    후보 시간
                  </span>
                  <span className="mt-2 text-xl font-bold leading-[30px] text-[#101828]">
                    {candidateOptions.length}개
                  </span>
                </div>
                <div className="flex flex-col justify-center px-6">
                  <span className="text-sm font-bold leading-[21px] text-[#98A2B3]">
                    현재 상태
                  </span>
                  <span className="mt-2 text-base font-bold leading-6 text-[#101828]">
                    진행 중
                  </span>
                </div>
              </div>

              <div className="border-b border-[#E0E4EB] px-6 py-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-bold leading-[21px] text-[#101828]">
                    참여자 진행
                  </h3>
                  <span className="text-xs font-medium leading-[18px] text-[#98A2B3]">
                    응답 제출
                  </span>
                </div>
                <div className="relative pb-[46px]">
                  <div className="absolute left-[14px] right-[14px] top-3 h-1 rounded-full bg-[#E5E7EB]">
                    <div className="h-1 w-full rounded-full bg-[#635BFF]" />
                  </div>
                  <div className="absolute inset-x-0 top-0">
                    {["회의 초대", "일정 확인", "응답 제출"].map((step, index) => {
                      const positionClass =
                        index === 0
                          ? "left-0 items-start text-left"
                          : index === 1
                            ? "left-1/2 -translate-x-1/2 items-center text-center"
                            : "right-0 items-end text-right";

                      return (
                        <div
                          className={cn(
                            "absolute flex w-20 flex-col",
                            positionClass,
                          )}
                          key={step}
                        >
                          <div
                            className={cn(
                              "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold leading-[18px]",
                              index < 2
                                ? "bg-[#635BFF] text-white"
                                : "bg-white text-[#635BFF] ring-4 ring-[#F0EFFF]",
                            )}
                          >
                            {index < 2 ? (
                              <Check className="h-4 w-4" strokeWidth={3} />
                            ) : (
                              <span className="h-2.5 w-2.5 rounded-full bg-[#635BFF]" />
                            )}
                          </div>
                          <span className="mt-3 whitespace-nowrap text-xs font-medium leading-[18px] text-[#635BFF]">
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="px-6 pb-[72px] pt-5">
                <h3 className="text-xl font-bold leading-[30px] text-[#101828]">
                  후보 시간
                </h3>
                <p className="mt-2 text-sm font-medium leading-[21px] text-[#475467]">
                  입력한 일정을 제외한 후보 시간입니다. 가능한 시간을 선택하세요.
                </p>

                <div className="mt-4 grid grid-cols-3 gap-4">
                  {candidateOptions.map((option, index) => {
                    const selected = answers[option.id];

                    return (
                      <section
                        className="overflow-hidden rounded-lg border border-[#E0E4EB] bg-white"
                        key={option.id}
                      >
                        <div className="h-[62px] px-4 py-3">
                          <p className="text-sm font-bold leading-[21px] text-[#98A2B3]">
                            후보 {index + 1}
                          </p>
                          <p className="mt-1 text-base font-bold leading-6 text-[#101828]">
                            {option.label}
                          </p>
                        </div>
                        <button
                          className={cn(
                            "flex h-11 w-full items-center border-t border-[#E0E4EB] px-4 text-left text-sm font-medium leading-[21px]",
                            selected === "available"
                              ? "bg-[#F0EFFF] text-[#635BFF]"
                              : "bg-white text-[#475467]",
                          )}
                          onClick={() => selectAnswer(option.id, "available")}
                          type="button"
                        >
                          가능
                        </button>
                        <button
                          className={cn(
                            "flex h-11 w-full items-center border-t border-[#E0E4EB] px-4 text-left text-sm font-medium leading-[21px]",
                            selected === "unavailable"
                              ? "bg-[#F0EFFF] text-[#635BFF]"
                              : "bg-white text-[#475467]",
                          )}
                          onClick={() => selectAnswer(option.id, "unavailable")}
                          type="button"
                        >
                          불가능
                        </button>
                      </section>
                    );
                  })}
                </div>

                <div className="mt-6 flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-bold leading-6 text-[#101828]">
                      선택한 후보 시간을 확인하세요
                    </h4>
                    <p className="mt-1 text-[13px] font-medium leading-5 text-[#98A2B3]">
                      입력한 일정과 후보 시간의 일치 여부를 확인합니다.
                    </p>
                  </div>
                  <Button
                    className="h-12 w-32 rounded-lg bg-[#635BFF] text-base font-bold leading-6 text-white hover:bg-[#635BFF]/90 active:bg-[#554DE8]"
                    onClick={() => navigate("/meetings/response-status")}
                  >
                    응답 제출
                  </Button>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 flex h-[104px] w-full items-center gap-[34px] border-t border-[#E0E4EB] bg-white pl-0 pr-8 py-4">
          <div className="flex h-12 min-w-0 flex-1 items-center rounded-lg border border-[#E0E4EB] bg-[#F9FAFB]/80 px-4">
            <span className="text-sm font-medium leading-[21px] text-[#C9CED8]">
              채팅 중 일정 조율이 필요하면 회의를 만들어보세요
            </span>
          </div>
          <Button className="h-12 w-40 rounded-lg bg-[#AAA3FF] text-base font-bold leading-6 text-white hover:bg-[#9B93FF]">
            회의 만들기
          </Button>
        </div>
      </div>
    </MeetFlowLayout>
  );
}
