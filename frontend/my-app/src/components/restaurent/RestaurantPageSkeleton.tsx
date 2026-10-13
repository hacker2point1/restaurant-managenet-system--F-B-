export default function RestaurantPageSkeleton() {
  return (
    <div className="space-y-6">

      <div className="h-10 w-72 animate-pulse rounded-lg bg-gray-200" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {Array.from({ length: 4 }).map(
          (_, index) => (

            <div
              key={index}
              className="
                h-28
                animate-pulse
                rounded-xl
                bg-gray-200
              "
            />

          )
        )}

      </div>


      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

        {Array.from({ length: 6 }).map(
          (_, index) => (

            <div
              key={index}
              className="
                h-[480px]
                animate-pulse
                rounded-xl
                bg-gray-200
              "
            />

          )
        )}

      </div>

    </div>
  );
}