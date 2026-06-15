import { QueryClient } from "@tanstack/react-query";

/**
 * React Query Configuration
 * 
 * Global configuration for TanStack Query (React Query)
 * Customize these settings based on your app's needs
 */

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Time before data is considered stale (5 minutes)
      staleTime: 1000 * 60 * 5,

      // Time before inactive queries are garbage collected (10 minutes)
      gcTime: 1000 * 60 * 10,

      // Retry failed requests 3 times with exponential backoff
      retry: 3,

      // Retry delay function (exponential backoff)
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch on window focus (useful for web, can be disabled for mobile)
      refetchOnWindowFocus: false,

      // Refetch on reconnect
      refetchOnReconnect: true,

      // Refetch on mount if data is stale
      refetchOnMount: true,

      // Show errors in console during development
      throwOnError: false,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,

      // Retry delay for mutations
      retryDelay: 1000,
    },
  },
});
