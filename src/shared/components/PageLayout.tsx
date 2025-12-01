import { Box, Container, CircularProgress, Alert } from '@mui/material';
import { ReactNode } from 'react';
import AppNavigation from './AppNavigation';

interface PageLayoutProps {
  /**
   * Main page content
   */
  children: ReactNode;

  /**
   * Loading state - displays spinner when true
   * @default false
   */
  loading?: boolean;

  /**
   * Error object - displays error message when present
   */
  error?: Error | null;

  /**
   * Container max width
   * @default "md"
   */
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;

  /**
   * Hide navigation bar
   * @default false
   */
  hideNavigation?: boolean;

  /**
   * Additional navigation links for authenticated users
   */
  authenticatedLinks?: Array<{ label: string; to: string }>;

  /**
   * Additional navigation links for unauthenticated users
   */
  unauthenticatedLinks?: Array<{ label: string; to: string }>;

  /**
   * Hide default navigation links
   * @default false
   */
  hideDefaultNavLinks?: boolean;

  /**
   * Flex grow for full height layout
   * @default true
   */
  fullHeight?: boolean;

  /**
   * Custom error message override
   */
  errorMessage?: string;
}

/**
 * PageLayout Component
 *
 * Reusable page layout with navigation, loading states, and error handling.
 * Reduces boilerplate code for common page patterns.
 *
 * @example
 * // Basic usage
 * <PageLayout loading={loading} error={error}>
 *   <Typography>Page content</Typography>
 * </PageLayout>
 *
 * @example
 * // Without navigation
 * <PageLayout hideNavigation>
 *   <Typography>Landing page content</Typography>
 * </PageLayout>
 *
 * @example
 * // Custom nav links
 * <PageLayout
 *   authenticatedLinks={[{ label: 'Settings', to: '/settings' }]}
 * >
 *   <Typography>Page content</Typography>
 * </PageLayout>
 */
function PageLayout({
  children,
  loading = false,
  error = null,
  maxWidth = 'md',
  hideNavigation = false,
  authenticatedLinks,
  unauthenticatedLinks,
  hideDefaultNavLinks = false,
  fullHeight = true,
  errorMessage,
}: PageLayoutProps) {
  // Loading state
  if (loading) {
    return (
      <Box sx={{ flexGrow: 1 }}>
        {!hideNavigation && (
          <AppNavigation
            authenticatedLinks={authenticatedLinks}
            unauthenticatedLinks={unauthenticatedLinks}
            hideDefaultLinks={hideDefaultNavLinks}
          />
        )}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: hideNavigation ? '100vh' : 'calc(100vh - 64px)',
          }}
        >
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ flexGrow: 1 }}>
        {!hideNavigation && (
          <AppNavigation
            authenticatedLinks={authenticatedLinks}
            unauthenticatedLinks={unauthenticatedLinks}
            hideDefaultLinks={hideDefaultNavLinks}
          />
        )}
        <Container maxWidth={maxWidth} sx={{ mt: 4 }}>
          <Alert severity="error">{errorMessage || error.message || 'An error occurred'}</Alert>
        </Container>
      </Box>
    );
  }

  // Success state - render children
  return (
    <Box sx={{ flexGrow: fullHeight ? 1 : undefined, display: 'flex', flexDirection: 'column' }}>
      {!hideNavigation && (
        <AppNavigation
          authenticatedLinks={authenticatedLinks}
          unauthenticatedLinks={unauthenticatedLinks}
          hideDefaultLinks={hideDefaultNavLinks}
        />
      )}
      <Container maxWidth={maxWidth} sx={{ mt: 4, mb: 4, flexGrow: fullHeight ? 1 : undefined }}>
        {children}
      </Container>
    </Box>
  );
}

export default PageLayout;
