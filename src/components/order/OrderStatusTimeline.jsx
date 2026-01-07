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
        <ol role="list" className="flex items-center justify-between">
          {statuses.map((s, index) => (
            <li key={s.name} className="relative flex-1">
              {index <= currentStatusIndex ? (
                <div className="flex items-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600">
                    <CheckIcon className="h-6 w-6 text-background" aria-hidden="true" />
                  </span>
                  <span className="ml-4 text-sm font-medium text-foreground">{s.name}</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-border">
                    <span className="text-background0">{index + 1}</span>
                  </span>
                  <span className="ml-4 text-sm font-medium text-background0">{s.name}</span>
                </div>
              )}

              {index < statuses.length - 1 ? (
                <div
                  className={`absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 ${
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
