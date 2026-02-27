//scheduled pickup time + location

import { CalendarClock } from 'lucide-react';

const PickupTimeBadge = ({ time, location }) => {
  if (!time) return null;
  return (
    <div className="flex items-center gap-2 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-full">
      <CalendarClock className="w-3.5 h-3.5" />
      <span>Pickup: {time} · {location}</span>
    </div>
  );
};

export default PickupTimeBadge;
