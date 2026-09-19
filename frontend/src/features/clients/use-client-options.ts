"use client";

import { useEffect, useState } from "react";
import { fetchClientOptions } from "@/features/clients/api";
import type { ClientOption } from "@/types/client";

export function useClientOptions() {
  const [options, setOptions] = useState<ClientOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    fetchClientOptions()
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
