"use client";

import { useEffect, useState } from "react";
import { fetchOwnerOptions } from "@/features/owners/api";
import type { OwnerOption } from "@/types/owner";

export function useOwnerOptions() {
  const [options, setOptions] = useState<OwnerOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    fetchOwnerOptions()
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
