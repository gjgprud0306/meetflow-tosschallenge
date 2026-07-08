import type { Attendee } from "@/types/meeting";

export const attendees: Attendee[] = [
  {
    id: "owner",
    name: "Hyegyeong",
    initial: "혜",
    role: "Owner",
    required: true,
    color: "primary",
  },
  {
    id: "designer",
    name: "Designer",
    initial: "민",
    role: "Product Designer",
    required: true,
    color: "muted",
  },
  {
    id: "pm",
    name: "PM",
    initial: "준",
    role: "Product Manager",
    required: false,
    color: "secondary",
  },
];
