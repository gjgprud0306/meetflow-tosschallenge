import type { Attendee } from "@/types/meeting";

export const attendees: Attendee[] = [
  {
    id: "owner",
    name: "허혜경",
    initial: "혜",
    role: "Product Designer",
    required: true,
    color: "primary",
  },
  {
    id: "min",
    name: "김민서",
    initial: "민",
    role: "UX Researcher",
    required: true,
    color: "muted",
  },
  {
    id: "jun",
    name: "박준호",
    initial: "준",
    role: "Product Manager",
    required: true,
    color: "secondary",
  },
  {
    id: "seo",
    name: "윤서연",
    initial: "서",
    role: "Frontend Engineer",
    required: false,
    color: "muted",
  },
  {
    id: "ji",
    name: "윤지은",
    initial: "지",
    role: "Product Designer",
    required: false,
    color: "muted",
  },
  {
    id: "eun",
    name: "박은주",
    initial: "은",
    role: "Backend Engineer",
    required: false,
    color: "secondary",
  },
];
