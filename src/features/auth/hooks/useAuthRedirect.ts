import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

/**
 * Custom hook to redirect authenticated users
 * Used in login/register pages to prevent authenticated users from accessing auth pages
 *
 * @param redirectTo - Default path to redirect to (default: '/dashboard')
 * @param preserveFromLocation - Whether to preserve the 'from' location in state (default: true)
 *
 * @example
 * // In LoginPage - preserve return URL
 * useAuthRedirect('/dashboard', true);
 *
 * // In RegisterPage - always go to dashboard
 * useAuthRedirect('/dashboard', false);
 */
export function useAuthRedirect(redirectTo: string = '/dashboard', preserveFromLocation = true) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (user) {
      let destination = redirectTo;

      // Preserve the original destination if available (for login redirects)
      if (preserveFromLocation) {
        const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
        destination = from || redirectTo;
      }

      navigate(destination, { replace: true });
    }
  }, [user, navigate, location, redirectTo, preserveFromLocation]);
}
