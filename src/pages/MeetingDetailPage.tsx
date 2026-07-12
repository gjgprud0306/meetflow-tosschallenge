import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AvatarBadge } from "@/components/AvatarBadge";
import { MeetFlowLayout } from "@/components/MeetFlowLayout";
import { Button } from "@/components/ui/button";
import { slotById } from "@/context/availabilityUtils";
import { useMeetingFlow } from "@/context/useMeetingFlow";
import { attendees } from "@/mocks";
import { cn } from "@/lib/utils";

const confirmedDetailStorageKey = "mflow-confirmed-meeting-detail";

const meetingRooms = [
  { capacity: 6, id: "room-a", name: "A 회의실" },
  { capacity: 8, id: "room-b", name: "B 회의실" },
  { capacity: 10, id: "room-c", name: "C 회의실" },
];

type ConfirmedMeetingDetail = {
  attendeeIds: string[];
  dateLabel: string;
  displayDateTime: string;
  locationLabel: string;
  requiredAttendeeIds: string[];
  timeLabel: string;
  title: string;
};

function readConfirmedDetail(): ConfirmedMeetingDetail | null {
  const saved = window.localStorage.getItem(confirmedDetailStorageKey);

  if (!saved) return null;

  try {
    return JSON.parse(saved) as ConfirmedMeetingDetail;
  } catch {
    return null;
  }
}

function fallbackDetail(): ConfirmedMeetingDetail {
  const slot = slotById("slot-7-15-15");

  return {
    attendeeIds: attendees.map((attendee) => attendee.id),
    dateLabel: slot.dateLabel,
    displayDateTime: slot.label,
    locationLabel: "회의실 미정",
    requiredAttendeeIds: attendees
      .filter((attendee) => attendee.required)
      .map((attendee) => attendee.id),
    timeLabel: slot.timeLabel,
    title: "리뷰회의",
  };
}

export function MeetingDetailPage() {
  const navigate = useNavigate();
  const { meeting, updateMeeting } = useMeetingFlow();
  const [shareMessage, setShareMessage] = useState("");
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [draftRoomId, setDraftRoomId] = useState(meeting.selectedRoomId);
  const [detail, setDetail] = useState<ConfirmedMeetingDetail>(() => {
    const stored = readConfirmedDetail() ?? fallbackDetail();

    return {
      ...stored,
      attendeeIds: stored.attendeeIds.length
        ? stored.attendeeIds
        : meeting.attendeeIds,
      requiredAttendeeIds: stored.requiredAttendeeIds.length
        ? stored.requiredAttendeeIds
        : meeting.requiredAttendeeIds,
    };
  });
  const participantRows = useMemo(
    () =>
      detail.attendeeIds
        .map((attendeeId) => attendees.find((attendee) => attendee.id === attendeeId))
        .filter(Boolean),
    [detail.attendeeIds],
  );

  function completeRoomChange() {
    const room = meetingRooms.find((item) => item.id === draftRoomId);

    if (!room) return;

    const nextDetail = {
      ...detail,
      locationLabel: room.name,
    };

    updateMeeting({
      locationType: "internal",
      roomSelectionDeferred: false,
      selectedRoomId: room.id,
    });
    window.localStorage.setItem(confirmedDetailStorageKey, JSON.stringify(nextDetail));
    setDetail(nextDetail);
    setRoomModalOpen(false);
  }

  return (
    <MeetFlowLayout title="회의 상세">
      <div className="h-full w-full overflow-y-auto px-8 pb-10 pt-7">
        <section className="w-full max-w-[880px] rounded-xl border border-[#E0E4EB] bg-white shadow-[0_4px_16px_rgba(16,24,40,0.06)]">
          <div className="border-b border-[#E0E4EB] bg-[#F7F6FF] px-7 py-6">
            <span className="rounded-full bg-[#837CFF] px-3 py-1 text-xs font-bold leading-[18px] text-white">
              회의 확정
            </span>
            <h2 className="mt-4 text-2xl font-bold leading-8 text-[#101828]">
              {detail.title}
            </h2>
            <p className="mt-2 text-sm font-medium leading-[21px] text-[#667085]">
              확정된 회의 정보를 확인하고 필요한 후속 작업을 진행하세요.
            </p>
          </div>

          <div className="grid grid-cols-3 border-b border-[#E0E4EB]">
            <div className="px-7 py-5">
              <p className="text-xs font-bold leading-[18px] text-[#98A2B3]">
                확정 날짜/시간
              </p>
              <p className="mt-2 text-base font-bold leading-6 text-[#101828]">
                {detail.displayDateTime}
              </p>
            </div>
            <div className="border-l border-[#E0E4EB] px-7 py-5">
              <p className="text-xs font-bold leading-[18px] text-[#98A2B3]">
                장소
              </p>
              <p className="mt-2 text-base font-bold leading-6 text-[#101828]">
                {detail.locationLabel}
              </p>
            </div>
            <div className="border-l border-[#E0E4EB] px-7 py-5">
              <p className="text-xs font-bold leading-[18px] text-[#98A2B3]">
                참석 상태
              </p>
              <p className="mt-2 text-base font-bold leading-6 text-[#101828]">
                {detail.attendeeIds.length}/{detail.attendeeIds.length}명 참석 예정
              </p>
            </div>
          </div>

          <div className="px-7 py-6">
            <h3 className="text-base font-bold leading-6 text-[#101828]">
              참석자
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {participantRows.map((attendee) => {
                if (!attendee) return null;

                const required = detail.requiredAttendeeIds.includes(attendee.id);

                return (
                  <div
                    className="flex items-center justify-between rounded-lg border border-[#E0E4EB] bg-[#F9FAFB] px-4 py-3"
                    key={attendee.id}
                  >
                    <div className="flex min-w-0 items-center">
                      <AvatarBadge color={attendee.color} initial={attendee.initial} />
                      <div className="ml-3 min-w-0">
                        <p className="truncate text-sm font-bold leading-[21px] text-[#101828]">
                          {attendee.name}
                        </p>
                        <p className="text-xs font-medium leading-[18px] text-[#98A2B3]">
                          참석 예정
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-[2px] text-[11px] font-bold leading-[16px]",
                        required
                          ? "bg-[#F0EEFF] text-[#635BFF]"
                          : "bg-[#F3F4F6] text-[#667085]",
                      )}
                    >
                      {required ? "필수 참석자" : "선택 참석자"}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <Button
                className="h-12 rounded-lg border border-[#D0D5DD] bg-white text-sm font-bold leading-[21px] text-[#475467] hover:bg-[#F9FAFB]"
                onClick={() => navigate("/meetings/response-status")}
              >
                일정 변경
              </Button>
              <Button
                className="h-12 rounded-lg border border-[#D0D5DD] bg-white text-sm font-bold leading-[21px] text-[#475467] hover:bg-[#F9FAFB]"
                onClick={() => {
                  setDraftRoomId(meeting.selectedRoomId);
                  setRoomModalOpen(true);
                }}
              >
                회의실 변경
              </Button>
              <Button
                className="h-12 rounded-lg bg-[#635BFF] text-sm font-bold leading-[21px] text-white hover:bg-[#635BFF]/90 active:bg-[#554DE8]"
                onClick={() => setShareMessage("참석자에게 확정 일정을 다시 공유했습니다.")}
              >
                참석자에게 다시 공유
              </Button>
            </div>
            {shareMessage ? (
              <p className="mt-3 text-sm font-medium leading-[21px] text-[#635BFF]">
                {shareMessage}
              </p>
            ) : null}
          </div>
        </section>
      </div>

      {roomModalOpen ? (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#101828]/30 p-6">
          <section className="w-[440px] rounded-xl border border-[#E0E4EB] bg-white p-6 shadow-[0_20px_60px_rgba(16,24,40,0.16)]">
            <h2 className="text-lg font-bold leading-7 text-[#101828]">
              회의실 변경
            </h2>
            <p className="mt-2 text-sm font-medium leading-[21px] text-[#667085]">
              {detail.displayDateTime} · 참석 인원 {detail.attendeeIds.length}명
            </p>
            <div className="mt-5 space-y-2">
              {meetingRooms.map((room) => {
                const disabled = room.capacity < detail.attendeeIds.length;
                const selected = draftRoomId === room.id;

                return (
                  <button
                    className={cn(
                      "flex h-14 w-full items-center justify-between rounded-lg border px-4 text-left",
                      selected
                        ? "border-[#837CFF] bg-[#F7F6FF]"
                        : "border-[#E0E4EB] bg-[#F9FAFB]",
                      disabled && "cursor-not-allowed opacity-45",
                    )}
                    disabled={disabled}
                    key={room.id}
                    onClick={() => setDraftRoomId(room.id)}
                    type="button"
                  >
                    <span className="text-sm font-bold leading-[21px] text-[#101828]">
                      {room.name} · {room.capacity}명
                    </span>
                    <span
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full border",
                        selected
                          ? "border-[#837CFF] bg-[#837CFF]"
                          : "border-[#D0D5DD] bg-white",
                      )}
                    />
                  </button>
                );
              })}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-2">
              <Button
                className="h-11 rounded-lg border border-[#D0D5DD] bg-white text-sm font-bold leading-[21px] text-[#475467] hover:bg-[#F9FAFB]"
                onClick={() => setRoomModalOpen(false)}
              >
                취소
              </Button>
              <Button
                className="h-11 rounded-lg bg-[#635BFF] text-sm font-bold leading-[21px] text-white hover:bg-[#635BFF]/90 disabled:bg-[#C9CED8] disabled:text-white"
                disabled={!draftRoomId}
                onClick={completeRoomChange}
              >
                회의실 변경 완료
              </Button>
            </div>
          </section>
        </div>
      ) : null}
    </MeetFlowLayout>
  );
}
