You are an experienced product manager whose task is to create a comprehensive Product Requirements Document (PRD) based on the following descriptions:

<project_description>
# Web application - Cubetive (MVP)

## App description

Web application for improving your Rubik's cube skills.
It allows you to track your progress and improve your skills.

## Required features

- Saving yours solve times (only 3x3 cube)
- Account system which allows you to persist your data
- Statistics page which shows your progress
- Profile account which allows you to share your progress with others

## Optional features

- Matchmaking system - find other players to play with
- Allow to solve all types of cubes
- Export/Import the data
- Mobile application

## Success criteria
- 90% of users have at least one solve time saved
- 30% of users have their profile set as public
</project_description>

<project_details>
# Cubetive PRD Planning Summary

## Decisions Made

1. Target audience will include all skill levels from absolute beginners to advanced solvers
2. Statistics page will display Ao5, Ao12, Ao100, and visual progress charts
3. Authentication will use Supabase auth with basic email/password login
4. Public profiles will show only best time and best Ao5 for MVP
5. Timer will use spacebar start/stop controls
6. Scrambles will be generated using an open-source library (specific library to be chosen later)
7. MVP will be completely free with no monetization
8. Future differentiation will focus on social features and matchmaking system
9. MVP timeline is 6-8 weeks focusing on timer, basic statistics, and account creation
10. Data privacy compliance will not be addressed in MVP
11. Free tier will store up to 10,000 solves per user
12. Email verification, password reset, and session management will be implemented from day one
13. Timer will include DNF (Did Not Finish) and +2 penalty options
14. Session management features are not needed for MVP
15. Technical decisions about specific scramble library and tech stack are deferred

## Accepted Recommendations

1. Implement Ao5 and Ao12 as standard speedcubing metrics with visual progress charts for engagement
2. Use web-based timer with spacebar controls matching speedcubing standards
3. Include password reset functionality as critical for user retention
4. Add DNF and +2 penalty options as they're expected by competitive cubers
5. Prioritize timer functionality, basic statistics (last 5 solves, PB), and account creation for 6-8 week MVP
6. Store limited solve history to manage database costs (10,000 solves instead of recommended 1,000)
7. Focus on social features and gamification to differentiate from existing platforms
8. Implement basic authentication features (email verification, password reset) from the start

## Main Functional Requirements

### Core Timer Functionality
- Web-based timer with spacebar start/stop controls
- Support for DNF (Did Not Finish) and +2 second penalties
- Automatic scramble generation using open-source library
- Save and persist solve times (3x3 cube only for MVP)

### User Account System
- Registration and login via Supabase auth (email/password)
- Email verification required
- Password reset functionality
- Session management
- Storage of up to 10,000 solve times per user

### Statistics and Analytics
- Display of key metrics: Ao5, Ao12, Ao100 (averages)
- Visual progress charts showing improvement over time
- Personal best tracking
- Historical solve data access

### Social Features
- Public profile option (opt-in)
- Profile displays: best single time and best Ao5
- Profile sharing capability

## Key User Stories and Usage Paths

### Beginner User Path
1. User creates account with email/password
2. Completes email verification
3. Accesses timer interface
4. Receives scramble and solves cube
5. Timer captures solve time via spacebar
6. Views basic statistics and personal progress
7. Optionally makes profile public to share achievements

### Intermediate/Advanced User Path
1. User logs in to existing account
2. Starts solving session with WCA-style scrambles
3. Records multiple solves with DNF/+2 penalties when needed
4. Reviews detailed statistics (Ao5, Ao12, Ao100)
5. Analyzes progress trends via charts
6. Shares profile with best times publicly

## Success Criteria and Measurements

### Primary Success Metrics
- 90% of registered users have at least one solve time saved
- 30% of users set their profiles to public

### Implied Performance Indicators
- User retention (users with multiple solving sessions)
- Average number of solves per user
- Profile engagement (views of public profiles)

## Scope Boundaries

### In Scope for MVP
- 3x3 cube support only
- Basic timing and statistics
- Account system with authentication
- Public profiles with limited information

### Explicitly Out of Scope
- Other cube types (2x2, 4x4, etc.)
- Matchmaking system
- Data export/import functionality
- Mobile application
- Advanced session management
- Monetization features
- COPPA/GDPR compliance

## Unresolved Issues

1. **Specific scramble generation library** - Needs technical evaluation to choose between pyTwistyScrambler, cstimer's generator, or other options
2. **Technology stack** - Frontend framework, backend architecture, and database schema approach need to be defined
3. **Onboarding flow details** - How to handle different skill levels during initial user experience
4. **Progressive disclosure implementation** - Specific UI/UX approach for showing simple vs. advanced features
5. **Database schema design** - Structure to accommodate future features while optimizing for current MVP needs
6. **Performance requirements** - Timer precision requirements and acceptable latency for real-time features
7. **Browser compatibility** - Which browsers and versions to support
8. **Error handling strategy** - How to handle timer interruptions, network issues, and data sync problems
</project_details>

Follow these steps to create a comprehensive and well-organized document:

1. Divide the PRD into the following sections:
   a. Project Overview
   b. User Problem
   c. Functional Requirements
   d. Project Boundaries
   e. User Stories
   f. Success Metrics

2. In each section, provide detailed and relevant information based on the project description and answers to clarifying questions. Make sure to:
    - Use clear and concise language
    - Provide specific details and data as needed
    - Maintain consistency throughout the document
    - Address all points listed in each section

3. When creating user stories and acceptance criteria
    - List ALL necessary user stories, including basic, alternative, and edge case scenarios.
    - Assign a unique requirement identifier (e.g., US-001) to each user story for direct traceability.
    - Include at least one user story specifically for secure access or authentication, if the application requires user identification or access restrictions.
    - Ensure that no potential user interaction is omitted.
    - Ensure that each user story is testable.

Use the following structure for each user story:
- ID
- Title
- Description
- Acceptance Criteria

4. After completing the PRD, review it against this checklist:
    - Is each user story testable?
    - Are the acceptance criteria clear and specific?
    - Do we have enough user stories to build a fully functional application?
    - Have we included authentication and authorization requirements (if applicable)?

5. PRD Formatting:
    - Maintain consistent formatting and numbering.
    - Do not use bold formatting in markdown ( ** ).
    - List ALL user stories.
    - Format the PRD in proper markdown.

Prepare the PRD with the following structure:

```markdown
# Product Requirements Document (PRD) - {{app-name}}
## 1. Product Overview
## 2. User Problem
## 3. Functional Requirements
## 4. Product Boundaries
## 5. User Stories
## 6. Success Metrics
```

Remember to fill each section with detailed, relevant information based on the project description and our clarifying questions. Ensure the PRD is comprehensive, clear, and contains all relevant information needed for further product development.

The final output should consist solely of the PRD in the specified markdown format, which you will save in the file .ai/prd.md