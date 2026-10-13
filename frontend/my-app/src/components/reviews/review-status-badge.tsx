import { Badge } from "@/components/ui/badge";
import type { ReviewStatus } from "@/types/review";

const styles: Record<ReviewStatus, string> = {
  approved:
    "border-emerald-200 bg-emerald-50 text-emerald-700",
  pending:
    "border-amber-200 bg-amber-50 text-amber-800",
  rejected:
    "border-red-200 bg-red-50 text-red-700",
};

export function ReviewStatusBadge({ status }: { status: ReviewStatus }) {
  return (
    <Badge variant="outline" className={styles[status]}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}