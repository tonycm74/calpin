import { Bell, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ReminderSettingsProps {
  value: number[];
  onChange: (reminders: number[]) => void;
}

const REMINDER_OPTIONS = [
  { value: 0, label: "At time of event" },
  { value: 5, label: "5 minutes before" },
  { value: 10, label: "10 minutes before" },
  { value: 15, label: "15 minutes before" },
  { value: 30, label: "30 minutes before" },
  { value: 60, label: "1 hour before" },
  { value: 120, label: "2 hours before" },
  { value: 1440, label: "1 day before" },
  { value: 2880, label: "2 days before" },
  { value: 10080, label: "1 week before" },
];

export function ReminderSettings({ value, onChange }: ReminderSettingsProps) {
  const addReminder = () => {
    // Find a reminder option that's not already selected
    const available = REMINDER_OPTIONS.find(
      (opt) => !value.includes(opt.value)
    );
    if (available) {
      onChange([...value, available.value].sort((a, b) => a - b));
    }
  };

  const removeReminder = (minutes: number) => {
    onChange(value.filter((v) => v !== minutes));
  };

  const updateReminder = (oldValue: number, newValue: number) => {
    const updated = value.map((v) => (v === oldValue ? newValue : v));
    onChange([...new Set(updated)].sort((a, b) => a - b));
  };

  const getLabel = (minutes: number) => {
    return REMINDER_OPTIONS.find((opt) => opt.value === minutes)?.label || `${minutes} minutes before`;
  };

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2 text-foreground">
        <Bell className="w-4 h-4 text-primary" />
        Reminders
      </Label>
      
      <div className="space-y-2">
        {value.map((minutes, index) => (
          <div key={index} className="flex items-center gap-2">
            <Select
              value={minutes.toString()}
              onValueChange={(val) => updateReminder(minutes, parseInt(val))}
            >
              <SelectTrigger className="flex-1 bg-card border-border">
                <SelectValue>{getLabel(minutes)}</SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {REMINDER_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value.toString()}
                    disabled={value.includes(option.value) && option.value !== minutes}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => removeReminder(minutes)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {value.length < REMINDER_OPTIONS.length && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full border-dashed"
          onClick={addReminder}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Reminder
        </Button>
      )}

      {value.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No reminders set. Click "Add Reminder" to add one.
        </p>
      )}
    </div>
  );
}
