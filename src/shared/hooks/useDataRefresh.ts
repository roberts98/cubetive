/**
 * useDataRefresh Hook
 *
 * Lightweight event system for coordinating data refetches across components.
 * Used to notify components when data changes (e.g., after saving a solve).
 *
 * This is a simple publish-subscribe pattern without external dependencies.
 */

import { useEffect, useRef } from 'react';

type RefreshCallback = () => void | Promise<void>;
type RefreshEvent = 'solves' | 'profile' | 'all';

// Global registry of callbacks by event type
const refreshCallbacks: Map<RefreshEvent, Set<RefreshCallback>> = new Map([
  ['solves', new Set()],
  ['profile', new Set()],
  ['all', new Set()],
]);

/**
 * Triggers a refresh event, calling all subscribed callbacks
 *
 * @param event - The event type to trigger ('solves', 'profile', or 'all')
 *
 * @example
 * // After saving a solve
 * triggerRefresh('solves');
 *
 * // After updating profile
 * triggerRefresh('profile');
 *
 * // When you want to refresh everything
 * triggerRefresh('all');
 */
export function triggerRefresh(event: RefreshEvent): void {
  // Get callbacks for the specific event
  const eventCallbacks = refreshCallbacks.get(event);
  if (eventCallbacks) {
    eventCallbacks.forEach((callback) => {
      void callback();
    });
  }

  // If not 'all', also trigger 'all' callbacks
  if (event !== 'all') {
    const allCallbacks = refreshCallbacks.get('all');
    if (allCallbacks) {
      allCallbacks.forEach((callback) => {
        void callback();
      });
    }
  }
}

/**
 * Hook for subscribing to data refresh events
 *
 * Components use this to automatically refetch data when relevant events occur.
 * The callback is automatically cleaned up when the component unmounts.
 *
 * @param event - The event type to subscribe to ('solves', 'profile', or 'all')
 * @param callback - Function to call when the event is triggered
 *
 * @example
 * function DashboardPage() {
 *   const { execute: refetchSolves } = useSolves();
 *
 *   // Automatically refetch solves when they change
 *   useDataRefresh('solves', refetchSolves);
 *
 *   return <div>...</div>;
 * }
 *
 * @example
 * function ProfilePage() {
 *   const { execute: refetchProfile } = useCurrentProfile();
 *
 *   // Refetch profile when it changes OR when anything changes
 *   useDataRefresh('profile', refetchProfile);
 *
 *   return <div>...</div>;
 * }
 */
export function useDataRefresh(event: RefreshEvent, callback: RefreshCallback): void {
  // Use ref to always have the latest callback without re-subscribing
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    // Wrapper that uses the ref
    const wrappedCallback = () => {
      void callbackRef.current();
    };

    // Subscribe
    const callbacks = refreshCallbacks.get(event);
    if (callbacks) {
      callbacks.add(wrappedCallback);
    }

    // Cleanup: Unsubscribe on unmount
    return () => {
      const callbacks = refreshCallbacks.get(event);
      if (callbacks) {
        callbacks.delete(wrappedCallback);
      }
    };
  }, [event]);
}
