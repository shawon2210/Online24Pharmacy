import { CheckIcon } from "@heroicons/react/24/solid";

const statuses = [
  { id: "confirmed", name: "Order Confirmed" },
  { id: "processing", name: "Processing" },
  { id: "shipped", name: "Shipped" },
  { id: "delivered", name: "Delivered" },
];

export default function OrderStatusTimeline({ status }) {
  const currentStatusIndex = statuses.findIndex((s) => s.id === status);

  return (
    <div className="py-4">
      <nav aria-label="Progress">
        <ol
          role="list"
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0"
        >
          {statuses.map((s, index) => (
            <li key={s.name} className="relative flex-1 w-full sm:w-auto">
              {index <= currentStatusIndex ? (
                <div className="flex items-center">
                  <span className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-emerald-600 flex-shrink-0">
                    <CheckIcon
                      className="h-4 w-4 sm:h-6 sm:w-6 text-background"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="ml-3 sm:ml-4 text-sm sm:text-base font-medium text-foreground">
                    {s.name}
                  </span>
                </div>
              ) : (
                <div className="flex items-center">
                  <span className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border-2 border-border flex-shrink-0">
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      {index + 1}
                    </span>
                  </span>
                  <span className="ml-3 sm:ml-4 text-sm sm:text-base font-medium text-muted-foreground">
                    {s.name}
                  </span>
                </div>
              )}

              {index < statuses.length - 1 ? (
                <div
                  className={`absolute left-3 sm:left-4 top-6 sm:top-4 -ml-px mt-0.5 h-full w-0.5 ${
                    index < currentStatusIndex ? "bg-emerald-600" : "bg-border"
                  }`}
                  aria-hidden="true"
                />
              ) : null}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}
