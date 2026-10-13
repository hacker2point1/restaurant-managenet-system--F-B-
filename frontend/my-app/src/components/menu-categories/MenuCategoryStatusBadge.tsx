import { Badge } from "@/components/ui/badge";

interface Props {
  isActive: boolean;
}

export default function MenuCategoryStatusBadge({
  isActive,
}: Props) {
  return (
    <Badge
      variant="outline"
      className={
        isActive
          ? "border-emerald-200 bg-emerald-50 text-emerald-600"
          : "border-slate-200 bg-slate-100 text-slate-500"
      }
    >
      {isActive ? "Active" : "Draft"}
    </Badge>
  );
}