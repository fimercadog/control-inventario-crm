"use client";

import { useEffect, useState } from "react";
import { fetchPropertyOptions } from "@/features/properties/api";
import type { PropertyOption } from "@/types/property";

export function usePropertyOptions() {
  const [options, setOptions] = useState<PropertyOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    fetchPropertyOptions()
      .then((data) => {
        if (!ignore) setOptions(data);
      })
      .catch(() => {
        // options list is a non-critical enhancement; leave empty on failure
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  return { options, isLoading };
}
