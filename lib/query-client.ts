import { QueryClient } from "@tanstack/react-query";
import { cache } from "react";

const defaultQueryOptions = {
  queries: {
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  },
};

/**
 * Server-side: creates a NEW QueryClient per request.
 * React `cache` ensures the same instance is reused within a single request,
 * but a fresh one is created for each new request (prevents data leaking between users).
 */
export const getQueryClient = cache(
  () =>
    new QueryClient({
      defaultOptions: defaultQueryOptions,
    }),
);

/**
 * Client-side: singleton QueryClient shared across the entire browser session.
 * Used by QueryProvider in the component tree.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    ...defaultQueryOptions,
    queries: {
      ...defaultQueryOptions.queries,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
