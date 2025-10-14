# Requirements Document

## Introduction

This feature will improve the visual hierarchy of the monthly timetable view by making the brand color elements more transparent on days that are not part of the current month. This will help users focus on the current month's schedule while still maintaining visibility of adjacent month days for context.

## Requirements

### Requirement 1

**User Story:** As a schedule manager, I want days from other months in the monthly view to have more transparent brand color elements, so that I can better focus on the current month's schedule while still seeing context from adjacent months.

#### Acceptance Criteria

1. WHEN viewing the monthly timetable THEN days that are not in the current month SHALL have brand color elements with reduced opacity
2. WHEN a day belongs to the previous or next month THEN the brand color borders, backgrounds, and text SHALL be rendered with 50% transparency
3. WHEN a day belongs to the current month THEN the brand color elements SHALL maintain their normal opacity
4. WHEN switching between light and dark themes THEN the transparency effect SHALL work consistently in both modes

### Requirement 2

**User Story:** As a user, I want the transparency effect to apply to all brand color elements on other-month days, so that the visual hierarchy is consistent across all UI components.

#### Acceptance Criteria

1. WHEN a day is marked as other-month THEN all elements using brand color variables SHALL have reduced opacity
2. WHEN shift cards are displayed on other-month days THEN their brand color elements SHALL be more transparent
3. WHEN holiday indicators are shown on other-month days THEN their brand color styling SHALL be more transparent
4. WHEN interactive elements (borders, highlights) use brand color on other-month days THEN they SHALL have reduced opacity

### Requirement 3

**User Story:** As a developer, I want the transparency implementation to be maintainable and consistent, so that future brand color changes automatically apply the transparency effect.

#### Acceptance Criteria

1. WHEN implementing the transparency effect THEN it SHALL use CSS custom properties (CSS variables) for brand colors
2. WHEN the brand color is changed THEN the transparency effect SHALL automatically apply to the new color
3. WHEN new brand color elements are added THEN they SHALL automatically inherit the transparency effect on other-month days
4. WHEN the implementation is complete THEN it SHALL not require hardcoded color values