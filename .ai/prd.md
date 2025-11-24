# Product Requirements Document (PRD) - Cubetive

## 1. Product Overview

### Product Name
Cubetive - Web Application for Rubik's Cube Skills Improvement (MVP)

### Product Description
Cubetive is a web-based application designed to help speedcubing enthusiasts of all skill levels track, analyze, and improve their Rubik's cube solving abilities. The platform provides a professional-grade timer with standardized controls, comprehensive performance statistics, and social sharing capabilities to create an engaging community experience.

### Target Audience
- Primary: Rubik's cube enthusiasts ranging from absolute beginners to advanced competitive speedcubers
- Secondary: Casual puzzle solvers interested in tracking their improvement
- Tertiary: Speedcubing communities looking for a platform to share achievements

### Product Vision
To become the go-to platform for Rubik's cube enthusiasts to track their progress, improve their solving skills, and connect with the speedcubing community through data-driven insights and social features.

### MVP Scope
The initial release focuses on delivering core timing functionality, essential statistics, and basic social features for 3x3 cube solving only, with planned expansion to support additional cube types and advanced features in future releases.

## 2. User Problem

### Primary Problems

#### Lack of Persistent Progress Tracking
Speedcubers struggle to maintain a comprehensive record of their solving history across different practice sessions and devices. Many existing solutions either don't save data permanently or require manual tracking, making it difficult to analyze long-term improvement trends.

#### Limited Social Validation and Sharing
Current tools often lack integrated social features, forcing users to manually screenshot and share their achievements on external platforms. This creates friction in the natural desire to celebrate milestones and compare progress with peers.

#### Fragmented User Experience
Existing solutions often require users to juggle multiple tools: one for timing, another for scramble generation, and separate platforms for statistics and social interaction. This fragmentation disrupts practice flow and reduces engagement.

### Secondary Problems

#### Inconsistent Timing Standards
Many casual timing apps don't follow World Cube Association (WCA) standards for controls and penalties, making it difficult for users transitioning to competitive solving.

#### Limited Statistical Analysis
Basic timing apps often show only recent times without providing meaningful metrics like running averages (Ao5, Ao12, Ao100) that are standard in the speedcubing community.

#### No Progressive Skill Development
Existing tools don't adapt to user skill levels or provide guidance for improvement, leaving beginners overwhelmed and advanced users under-challenged.

## 3. Functional Requirements

### Core Timer System

#### Timer Interface (FR-001)
- Spacebar-activated start/stop mechanism following WCA standards
- Visual countdown/ready indicator before timer starts
- Large, clearly visible time display during solve
- Automatic save of completed solve times
- Support for keyboard shortcuts for penalties and actions

#### Scramble Generation (FR-002)
- Automatic generation of WCA-compliant 3x3 scrambles
- Display of scramble notation in standard format
- New scramble generation after each solve
- Visual scramble preview (future enhancement)

#### Penalty System (FR-003)
- DNF (Did Not Finish) marking capability
- +2 second penalty option for misaligned finishes
- Ability to modify penalties after solve completion
- Clear visual indicators for penalized solves

### User Account Management

#### Authentication System (FR-004)
- Email/password-based registration
- Mandatory email verification for new accounts
- Secure password requirements (minimum 8 characters)
- Session persistence with automatic timeout
- Remember me functionality for trusted devices

#### Password Management (FR-005)
- Self-service password reset via email
- Secure token-based reset links with expiration
- Password strength indicator during registration/change
- Optional password change from account settings

#### User Profile (FR-006)
- Unique username assignment
- Profile visibility toggle (public/private)
- Basic profile information editing
- Account deletion capability

### Statistics and Analytics

#### Performance Metrics (FR-007)
- Real-time calculation of Ao5 (Average of 5)
- Real-time calculation of Ao12 (Average of 12)
- Real-time calculation of Ao100 (Average of 100)
- Personal best (PB) single time tracking
- Best Ao5 and Ao12 tracking
- Session-based statistics

#### Visual Analytics (FR-008)
- Line chart showing solve time progression
- Bar chart for time distribution analysis
- Trend indicators for improvement/regression
- Customizable date range filters
- Export capability for charts (future)

#### Data Management (FR-009)
- Storage of up to 10,000 solve records per user
- Chronological solve history with pagination
- Individual solve deletion capability
- Bulk deletion options
- Data retention for inactive accounts

### Social Features

#### Public Profiles (FR-010)
- Opt-in public profile functionality
- Display of best single time
- Display of best Ao5
- Unique shareable profile URL
- Profile view counter
- Recent activity feed (limited to last 10 solves)

#### Sharing Capabilities (FR-011)
- Direct link sharing for profiles
- Social media integration preparation (future)
- Achievement badges (future)
- Leaderboards (future)

### System Requirements

#### Performance (FR-012)
- Timer precision to milliseconds
- Sub-100ms response time for timer start/stop
- Page load time under 3 seconds
- Real-time statistics calculation
- Smooth animations at 60fps

#### Compatibility (FR-013)
- Support for modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Responsive design for desktop and tablet
- Keyboard navigation support
- Basic accessibility compliance (WCAG 2.1 Level A)

## 4. Product Boundaries

### In Scope - MVP

#### Core Functionality
- 3x3 Rubik's cube timing and tracking
- WCA-standard timer controls and penalties
- User registration and authentication via Supabase
- Email verification and password reset
- Basic statistics (Ao5, Ao12, Ao100, PB)
- Visual progress charts
- Public profile sharing with limited information
- Up to 10,000 solve storage per user
- Web-based interface only

#### User Experience
- Simplified onboarding for beginners
- Standard speedcubing terminology and metrics
- Clean, focused interface design
- Mobile-responsive layout (viewing only, not optimized for solving)

### Out of Scope - MVP

#### Cube Variations
- Other cube types (2x2, 4x4, 5x5, etc.)
- Non-cubic puzzles (Pyraminx, Megaminx, etc.)
- Blindfolded solving categories
- One-handed solving categories

#### Advanced Features
- Matchmaking and head-to-head competitions
- Real-time multiplayer sessions
- Advanced session management tools
- Custom training programs
- Algorithm trainers
- Video tutorials or learning content

#### Platform Extensions
- Native mobile applications (iOS/Android)
- Desktop applications
- Offline mode with sync
- Browser extensions
- API for third-party integrations

#### Data and Compliance
- Data import from other platforms
- Data export in multiple formats (CSV, JSON)
- GDPR compliance features
- COPPA compliance for users under 13
- Advanced privacy controls

#### Monetization
- Premium subscriptions
- Ad integration
- Paid features or storage upgrades
- Merchandise or affiliate programs

### Future Considerations

#### Phase 2 Features (Post-MVP)
- Support for additional cube types
- Advanced session management
- Matchmaking system implementation
- Mobile application development
- Data import/export functionality

#### Phase 3 Features
- Competition hosting capabilities
- Advanced analytics and insights
- AI-powered improvement recommendations
- Community features (forums, groups)
- Integration with WCA competition results

## 5. User Stories

### Authentication and Account Management

#### US-001: User Registration
- Title: Create New Account
- Description: As a new user, I want to create an account so that I can save my solve times persistently
- Acceptance Criteria:
  - User can access registration form from landing page
  - Email address validation is performed
  - Password meets minimum security requirements (8+ characters)
  - Duplicate email addresses are rejected with appropriate message
  - Successful registration triggers verification email
  - User receives confirmation of email sent

#### US-002: Email Verification
- Title: Verify Email Address
- Description: As a newly registered user, I want to verify my email address to activate my account
- Acceptance Criteria:
  - Verification email is sent within 1 minute of registration
  - Verification link is unique and expires after 24 hours
  - Clicking valid link activates account and redirects to login
  - Expired links show appropriate error message
  - User can request new verification email

#### US-003: User Login
- Title: Access Account
- Description: As a registered user, I want to log into my account to access my data
- Acceptance Criteria:
  - Login form accepts email and password
  - Invalid credentials show generic error message
  - Successful login redirects to timer dashboard
  - Unverified accounts show verification reminder
  - "Remember me" option maintains session for 30 days

#### US-004: Password Reset
- Title: Recover Account Access
- Description: As a user who forgot my password, I want to reset it via email
- Acceptance Criteria:
  - Reset request form accepts email address
  - Reset email sent for valid accounts only
  - Reset link expires after 1 hour
  - New password must meet security requirements
  - Successful reset confirms change and redirects to login
  - All active sessions are terminated after password change

#### US-005: Profile Management
- Title: Update Profile Settings
- Description: As a logged-in user, I want to manage my profile settings
- Acceptance Criteria:
  - User can change username (subject to uniqueness)
  - User can toggle profile visibility (public/private)
  - User can update email address (requires reverification)
  - User can change password (requires current password)
  - Changes are saved with confirmation message
  - User can delete account with confirmation dialog

### Timer Functionality

#### US-006: Start Solving Session
- Title: Begin Timing Practice
- Description: As a user, I want to start a solving session to practice my cube solving
- Acceptance Criteria:
  - Timer interface loads as default view after login
  - Initial scramble is displayed automatically
  - Timer shows 0.00 format when ready
  - Instructions for spacebar control are visible
  - Timer is accessible via keyboard only

#### US-007: Generate Scramble
- Title: Get New Scramble
- Description: As a user, I want to receive a random scramble for my solve
- Acceptance Criteria:
  - Scramble uses standard WCA notation
  - Scramble is exactly 20 moves for 3x3
  - Scramble is displayed clearly above timer
  - New scramble generates after each solve
  - User can manually generate new scramble
  - Scramble is saved with solve time

#### US-008: Time a Solve
- Title: Record Solve Time
- Description: As a user, I want to time my solve using standard controls
- Acceptance Criteria:
  - Pressing spacebar starts 0.5-second ready phase
  - Timer turns green when ready to start
  - Releasing spacebar starts timer
  - Timer displays running time in seconds.milliseconds
  - Pressing spacebar stops timer
  - Final time is displayed prominently
  - Time is automatically saved to history

#### US-009: Apply DNF Penalty
- Title: Mark Failed Solve
- Description: As a user, I want to mark a solve as DNF when I couldn't complete it
- Acceptance Criteria:
  - DNF button is accessible after solve
  - DNF can be toggled on/off for recent solve
  - DNF solves show "DNF" instead of time
  - DNF solves are excluded from averages
  - DNF status is saved with solve record
  - Visual indicator distinguishes DNF solves

#### US-010: Apply +2 Penalty
- Title: Add Time Penalty
- Description: As a user, I want to add a +2 penalty for misaligned cube finish
- Acceptance Criteria:
  - +2 button is accessible after solve
  - +2 can be toggled on/off for recent solve
  - Penalized time shows original time +2.00
  - +2 indicator is visible on solve
  - Penalized time is used in averages
  - Penalty status is saved with solve record

#### US-011: Delete Solve
- Title: Remove Solve Time
- Description: As a user, I want to delete a solve time from my history
- Acceptance Criteria:
  - Delete option available for each solve in history
  - Confirmation dialog prevents accidental deletion
  - Deleted solve is immediately removed from display
  - Statistics recalculate after deletion
  - Deletion cannot be undone
  - User can delete most recent solve

### Statistics and Progress Tracking

#### US-012: View Current Session
- Title: See Session Statistics
- Description: As a user, I want to see my current session statistics
- Acceptance Criteria:
  - Current session shows last 5 solves
  - Current Ao5 is displayed if 5+ solves
  - Current Ao12 is displayed if 12+ solves
  - Session best and worst times are highlighted
  - Statistics update immediately after each solve
  - Session can be cleared/reset

#### US-013: View Personal Records
- Title: Track Best Performances
- Description: As a user, I want to see my all-time best performances
- Acceptance Criteria:
  - Personal best single time is displayed
  - Best Ao5 is shown with date achieved
  - Best Ao12 is shown with date achieved
  - Records update automatically when beaten
  - Visual celebration when new record is set
  - Records persist across sessions

#### US-014: View Solve History
- Title: Browse Past Solves
- Description: As a user, I want to view my complete solve history
- Acceptance Criteria:
  - History shows all solves chronologically
  - Each solve displays time, date, and scramble
  - Penalties (DNF/+2) are clearly marked
  - History supports pagination (50 per page)
  - User can navigate to specific dates
  - Total solve count is displayed

#### US-015: View Progress Charts
- Title: Analyze Improvement Trends
- Description: As a user, I want to see visual charts of my progress
- Acceptance Criteria:
  - Line chart shows solve times over time
  - Chart includes moving average trend line
  - Date range can be customized
  - Chart is responsive and interactive
  - Key statistics are highlighted
  - Chart updates with new solves

#### US-016: Calculate Running Averages
- Title: See Standard Averages
- Description: As a user, I want to see my running averages calculated correctly
- Acceptance Criteria:
  - Ao5 excludes best and worst of 5 solves
  - Ao12 excludes best and worst of 12 solves
  - Ao100 excludes best 5 and worst 5 of 100 solves
  - DNF counts as worst in average calculations
  - Averages update after each solve
  - Insufficient solves show "N/A"

### Social Features

#### US-017: Make Profile Public
- Title: Share Profile Publicly
- Description: As a user, I want to make my profile public to share achievements
- Acceptance Criteria:
  - Toggle switch in settings controls visibility
  - Public profiles get unique shareable URL
  - Confirmation dialog explains what will be shared
  - Change takes effect immediately
  - User can revert to private anytime
  - Default state is private

#### US-018: View Public Profile
- Title: Access Shared Profile
- Description: As anyone with the link, I want to view a public profile
- Acceptance Criteria:
  - Public profile loads without authentication
  - Profile shows username and join date
  - Best single time is displayed
  - Best Ao5 is displayed
  - Recent activity shows last 10 solves
  - Private profiles show "Profile is private" message

#### US-019: Share Profile Link
- Title: Get Shareable URL
- Description: As a user with a public profile, I want to share my profile link
- Acceptance Criteria:
  - Copy link button in profile settings
  - Link format is clean and memorable
  - Link works when profile is public
  - Copied confirmation appears briefly
  - Link remains stable (doesn't change)
  - QR code generation (future)

### Data Management

#### US-020: Export Solve Data
- Title: Download My Data (Future)
- Description: As a user, I want to export my solve data for backup
- Acceptance Criteria:
  - Export option in account settings
  - Data includes all solves and statistics
  - CSV format is supported
  - File downloads to user's device
  - Export includes scrambles and penalties
  - Date range selection available

#### US-021: Manage Storage Limit
- Title: Handle Storage Capacity
- Description: As a user approaching 10,000 solves, I want to manage my storage
- Acceptance Criteria:
  - Warning appears at 9,500 solves
  - Clear message about 10,000 limit
  - Option to delete old solves
  - Bulk deletion tools available
  - Counter shows current usage
  - Oldest solves are auto-removed when limit reached

### Error Handling and Edge Cases

#### US-022: Handle Timer Interruption
- Title: Recover from Timer Error
- Description: As a user experiencing timer interruption, I want to recover gracefully
- Acceptance Criteria:
  - Browser refresh doesn't lose current solve
  - Network disconnection shows warning
  - Timer continues working offline
  - Data syncs when connection restored
  - Conflicting times are resolved
  - User is notified of any issues

#### US-023: Handle Session Timeout
- Title: Re-authenticate Expired Session
- Description: As a user with expired session, I want to log back in easily
- Acceptance Criteria:
  - Session expiry shows clear message
  - Login form appears as modal
  - Current page context is preserved
  - Successful login returns to same page
  - Unsaved data warning if applicable
  - Remember me prevents frequent timeouts

#### US-024: Handle Concurrent Sessions
- Title: Use Account from Multiple Devices
- Description: As a user on multiple devices, I want consistent data everywhere
- Acceptance Criteria:
  - Login works on multiple devices
  - Data syncs across all sessions
  - Recent solves appear on all devices
  - Statistics are consistent
  - Logout on one doesn't affect others
  - Conflicts are handled gracefully

### Mobile Experience

#### US-025: Access on Mobile Device
- Title: View Stats on Phone
- Description: As a mobile user, I want to check my statistics on my phone
- Acceptance Criteria:
  - Site is responsive on mobile screens
  - Statistics are clearly readable
  - Navigation works with touch
  - Charts are viewable (pinch to zoom)
  - Profile sharing works on mobile
  - Timer is viewable but not optimized for solving

### Accessibility

#### US-026: Navigate with Keyboard
- Title: Use Keyboard Navigation
- Description: As a keyboard user, I want to navigate the entire application
- Acceptance Criteria:
  - All interactive elements are keyboard accessible
  - Tab order is logical
  - Focus indicators are visible
  - Skip links available
  - Escape key closes modals
  - Shortcuts don't conflict with screen readers

#### US-027: Use with Screen Reader
- Title: Access with Assistive Technology
- Description: As a screen reader user, I want to use the application
- Acceptance Criteria:
  - All content has proper semantic HTML
  - Images have alt text
  - Forms have proper labels
  - Error messages are announced
  - Dynamic content updates are announced
  - ARIA labels where needed

## 6. Success Metrics

### Primary KPIs

#### User Engagement
- Target: 90% of registered users have at least one solve time saved
- Measurement: Count of users with solves / Total registered users
- Timeline: Measured 30 days post-registration
- Current: To be measured after launch

#### Social Adoption
- Target: 30% of active users have public profiles
- Measurement: Public profiles / Active users (logged in last 30 days)
- Timeline: Measured monthly after 3 months post-launch
- Current: To be measured after launch

### Secondary KPIs

#### User Retention
- Target: 60% of users return within 7 days of registration
- Measurement: 7-day retention cohort analysis
- Timeline: Measured weekly
- Threshold: Alert if drops below 40%

#### Solving Activity
- Target: Average of 20 solves per active user per week
- Measurement: Total weekly solves / Weekly active users
- Timeline: Measured weekly
- Threshold: Success if above 15 solves

#### Profile Engagement
- Target: Public profiles receive average of 5 views per week
- Measurement: Total profile views / Public profiles
- Timeline: Measured weekly
- Threshold: Indicates social feature value

### Performance Metrics

#### System Performance
- Timer Accuracy: <10ms variance from true time
- Page Load Speed: <3 seconds on 3G connection
- API Response Time: <200ms for 95th percentile
- Uptime: 99.9% availability

#### User Experience
- Registration Completion Rate: >80%
- Email Verification Rate: >90%
- Solve Save Success Rate: >99.9%
- Chart Render Time: <500ms

### Growth Metrics

#### User Acquisition
- Target: 100 registered users in first month
- Target: 500 registered users by month 3
- Target: 1000 registered users by month 6
- Organic vs. Referred: Track source attribution

#### Data Growth
- Average solves per user: Track monthly
- Storage utilization: Monitor per-user average
- Database growth rate: Project capacity needs

### Quality Metrics

#### Error Rates
- JavaScript Error Rate: <0.1% of sessions
- Failed Login Attempts: <5% of total attempts
- Failed Save Attempts: <0.01% of solves
- 404 Error Rate: <1% of page views

#### User Satisfaction (Future)
- NPS Score: Target >50
- Support Ticket Rate: <2% of MAU
- Feature Request Tracking: Categorize and prioritize
- User Feedback: Implement feedback mechanism

### Business Impact

#### Cost Efficiency
- Infrastructure Cost per User: Track monthly
- Storage Cost per 1000 Solves: Optimize over time
- Support Cost per User: Minimize through good UX

#### Market Position (Future)
- Feature Parity: Compare with competitors
- Unique Value Metrics: Track exclusive features usage
- Community Growth: Monitor social sharing rate

### Monitoring and Alerting

#### Real-time Alerts
- Server downtime
- Database connection failures
- Error rate spikes (>5x baseline)
- Storage capacity warnings (>80%)

#### Daily Reports
- New user registrations
- Active users
- Total solves recorded
- System performance summary

#### Weekly Analysis
- Retention cohort performance
- Feature usage patterns
- User journey drop-off points
- Performance trends

### Success Criteria Review

The MVP will be considered successful if:
1. Primary KPIs are met within 3 months of launch
2. System performance metrics are consistently achieved
3. User retention remains above 40% threshold
4. No critical security incidents occur
5. User feedback indicates core value delivery

Regular review cycles will be conducted monthly to assess progress against these metrics and adjust strategies as needed.