import { Eye, Users, CalendarPlus, TrendingUp } from 'lucide-react';
import { EventAnalytics } from '@/hooks/useEventAnalytics';

interface EventAnalyticsDisplayProps {
  analytics: EventAnalytics | null | undefined;
  isLoading?: boolean;
  compact?: boolean;
}

export function EventAnalyticsDisplay({ 
  analytics, 
  isLoading, 
  compact = false 
}: EventAnalyticsDisplayProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-4 w-16 bg-secondary/50 rounded animate-pulse" />
        <div className="h-4 w-12 bg-secondary/50 rounded animate-pulse" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Eye className="w-3 h-3" />
          0 views
        </span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1" title="Total views">
          <Eye className="w-3 h-3" />
          {analytics.total_views}
        </span>
        <span className="flex items-center gap-1" title="Calendar adds">
          <CalendarPlus className="w-3 h-3" />
          {analytics.calendar_adds.total}
        </span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <StatCard
        icon={<Eye className="w-4 h-4" />}
        label="Views"
        value={analytics.total_views}
        subValue={`${analytics.views_today} today`}
      />
      <StatCard
        icon={<Users className="w-4 h-4" />}
        label="Unique Visitors"
        value={analytics.unique_visitors}
      />
      <StatCard
        icon={<CalendarPlus className="w-4 h-4" />}
        label="Calendar Adds"
        value={analytics.calendar_adds.total}
        breakdown={analytics.calendar_adds}
      />
      <StatCard
        icon={<TrendingUp className="w-4 h-4" />}
        label="This Week"
        value={analytics.views_this_week}
        subValue="views"
      />
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  subValue?: string;
  breakdown?: {
    google: number;
    apple: number;
    outlook: number;
    ics: number;
  };
}

function StatCard({ icon, label, value, subValue, breakdown }: StatCardProps) {
  return (
    <div className="bg-secondary/30 rounded-lg p-3">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="text-xl font-bold text-foreground">{value}</div>
      {subValue && (
        <div className="text-xs text-muted-foreground">{subValue}</div>
      )}
      {breakdown && (
        <div className="text-xs text-muted-foreground mt-1 space-x-2">
          {breakdown.google > 0 && <span>G: {breakdown.google}</span>}
          {breakdown.apple > 0 && <span>A: {breakdown.apple}</span>}
          {breakdown.outlook > 0 && <span>O: {breakdown.outlook}</span>}
          {breakdown.ics > 0 && <span>ICS: {breakdown.ics}</span>}
        </div>
      )}
    </div>
  );
}

interface MiniAnalyticsProps {
  totalViews: number;
  calendarAdds: number;
}

export function MiniAnalytics({ totalViews, calendarAdds }: MiniAnalyticsProps) {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
      <span className="flex items-center gap-1" title="Total views">
        <Eye className="w-3.5 h-3.5" />
        {totalViews} {totalViews === 1 ? 'view' : 'views'}
      </span>
      <span className="flex items-center gap-1" title="Calendar adds">
        <CalendarPlus className="w-3.5 h-3.5" />
        {calendarAdds} {calendarAdds === 1 ? 'add' : 'adds'}
      </span>
    </div>
  );
}

