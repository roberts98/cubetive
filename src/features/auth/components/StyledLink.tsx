import { Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import type { LinkProps } from '@mui/material';

interface StyledLinkProps extends Omit<LinkProps, 'component'> {
  to: string;
  children: string;
}

/**
 * Reusable styled link component
 * Consistent styling for navigation links in auth pages
 *
 * @param to - Route path
 * @param children - Link text
 *
 * @example
 * <StyledLink to="/register">Sign Up</StyledLink>
 */
function StyledLink({ to, children, ...linkProps }: StyledLinkProps) {
  return (
    <Link component={RouterLink} to={to} underline="hover" {...linkProps}>
      {children}
    </Link>
  );
}

export default StyledLink;
