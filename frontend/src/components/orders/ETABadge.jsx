//"Ready in ~15 mins" display

import { Clock } from 'lucide-react';
import { STATUS_CONFIG } from '../../constants/orderConstants';

const ETABadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status];
  if (!cfg || status === 'cancelled') return null;

  return (
    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full">
      <Clock className="w-3.5 h-3.5 text-primary-500" />
      <span>{cfg.eta}</span>
    </div>
  );
};

export default ETABadge;
