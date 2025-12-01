import { Box } from '@mui/material';
import type { ReactNode } from 'react';

interface TabPanelProps {
  /**
   * Tab panel content
   */
  children?: ReactNode;

  /**
   * Current tab index
   */
  index: number;

  /**
   * Active tab value
   */
  value: number;

  /**
   * Optional ID prefix for accessibility
   * @default "tabpanel"
   */
  idPrefix?: string;
}

/**
 * TabPanel Component
 *
 * Reusable tab panel for Material UI Tabs component.
 * Handles visibility and accessibility attributes.
 *
 * @example
 * <Tabs value={currentTab} onChange={handleChange}>
 *   <Tab label="Tab 1" />
 *   <Tab label="Tab 2" />
 * </Tabs>
 * <TabPanel value={currentTab} index={0}>
 *   <Typography>Content for Tab 1</Typography>
 * </TabPanel>
 * <TabPanel value={currentTab} index={1}>
 *   <Typography>Content for Tab 2</Typography>
 * </TabPanel>
 */
function TabPanel({ children, value, index, idPrefix = 'tabpanel', ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`${idPrefix}-${index}`}
      aria-labelledby={`${idPrefix}-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default TabPanel;
