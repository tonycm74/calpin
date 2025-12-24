import { Eye, CalendarPlus } from 'lucide-react';

interface MiniAnalyticsProps {
  totalViews: number;
  calendarAdds: number;
}

export function MiniAnalytics({ totalViews, calendarAdds }: MiniAnalyticsProps) {
  return (
    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      <span className="flex items-center gap-1">
        <Eye className="w-3 h-3" />
        {totalViews} view{totalViews !== 1 ? 's' : ''}
      </span>
      <span className="flex items-center gap-1">
        <CalendarPlus className="w-3 h-3" />
        {calendarAdds} add{calendarAdds !== 1 ? 's' : ''}
      </span>
    </div>
  );
}