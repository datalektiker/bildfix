"use client";

import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ASPECT_RATIOS } from "@/lib/constants";

interface AspectRatioSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function AspectRatioSelect({ 
  value, 
  onChange, 
  disabled = false 
}: AspectRatioSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={onChange}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select aspect ratio" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(ASPECT_RATIOS).map(([key, ratio]) => (
          <SelectItem key={key} value={key}>
            {ratio.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}