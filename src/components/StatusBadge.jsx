import React from 'react';
import { CheckCircle2, Clock, Truck } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  const styles = { 
    Shipped: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', 
    Pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20', 
    Processing: 'bg-blue-500/10 text-blue-500 border-blue-500/20' 
  };
  const Icons = { Shipped: Truck, Pending: Clock, Processing: CheckCircle2 };
  const Icon = Icons[status] || Truck;
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 w-fit ${styles[status] || styles.Shipped}`}>
      <Icon className="w-3 h-3" /> {status}
    </span>
  );
};