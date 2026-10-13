export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="h-16 animate-pulse rounded-xl bg-gray-200" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-xl bg-gray-200"
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="h-[390px] animate-pulse rounded-xl bg-gray-200" />

        <div className="h-[390px] animate-pulse rounded-xl bg-gray-200" />
      </div>
    </div>
  );
}