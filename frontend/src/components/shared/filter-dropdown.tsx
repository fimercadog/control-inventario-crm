"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface FilterOption {
  label: string;
  value: string;
}

interface FilterDropdownProps {
  label: string;
  value: string | undefined;
  options: FilterOption[];
  onChange: (value: string | undefined) => void;
}

const ALL_VALUE = "__all__";

export function FilterDropdown({ label, value, options, onChange }: FilterDropdownProps) {
  return (
    <Select value={value ?? ALL_VALUE} onValueChange={(next) => onChange(next === ALL_VALUE ? undefined : next)}>
      <SelectTrigger size="sm" className="w-[160px]">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_VALUE}>Todos: {label}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
