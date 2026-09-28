import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";

type RemovableBadgeProps = {
  label: string;
  onRemove: () => void;
};

export function RemovableBadge({ label, onRemove }: RemovableBadgeProps) {
  return (
    <Badge variant="secondary" className="gap-1 pr-1">
      {label}
      <button
        type="button"
        aria-label={`ลบ ${label}`}
        onClick={onRemove}
        className="rounded-full p-0.5 hover:bg-foreground/10"
      >
        <X />
      </button>
    </Badge>
  );
}