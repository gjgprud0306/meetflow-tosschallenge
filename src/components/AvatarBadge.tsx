import { cn } from "@/lib/utils";

type AvatarBadgeProps = {
  initial: string;
  color?: "primary" | "muted" | "secondary";
  size?: "sm" | "md";
  className?: string;
};

const colorClass = {
  primary: "bg-[#635BFF]",
  muted: "bg-[#98A2B3]",
  secondary: "bg-[#A7A1F5]",
};

const sizeClass = {
  sm: "h-8 w-8 text-xs leading-[18px]",
  md: "h-9 w-9 text-[13px] leading-5",
};

export function AvatarBadge({
  initial,
  color = "primary",
  size = "sm",
  className,
}: AvatarBadgeProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-bold text-white",
        colorClass[color],
        sizeClass[size],
        className,
      )}
    >
      {initial}
    </div>
  );
}
