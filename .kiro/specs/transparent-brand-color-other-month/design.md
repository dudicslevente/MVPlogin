# Design Document

## Overview

This feature will implement a CSS-based solution to make brand color elements more transparent on days that are not part of the current month in the monthly timetable view. The solution will leverage CSS custom properties and the existing `.other-month` class to create a visual hierarchy that helps users focus on the current month while maintaining context from adjacent months.

## Architecture

The implementation will use a pure CSS approach that:
1. Leverages the existing `.other-month` class applied to days from adjacent months
2. Creates new CSS custom properties for transparent brand colors
3. Uses CSS cascade and specificity to override brand colors on other-month days
4. Maintains compatibility with both light and dark themes

## Components and Interfaces

### CSS Custom Properties

New CSS variables will be added to the root scope:
- `--brand-color-transparent`: 50% opacity version of `--brand-color`
- `--brand-primary-transparent`: 50% opacity version of `--brand-primary`
- `--brand-secondary-transparent`: 50% opacity version of `--brand-secondary`

These will be defined for both light and dark themes using CSS `color-mix()` function or rgba/hsla values.

### CSS Selectors

The implementation will use the following selector pattern:
```css
.month-day.other-month [brand-color-element] {
    /* Override brand colors with transparent versions */
}
```

### Affected Elements

Elements that will receive the transparency treatment on other-month days:
1. **Month grid borders**: `.month-day.other-month` border colors
2. **Shift cards**: All shift card elements within other-month days
3. **Holiday indicators**: Holiday styling within other-month days
4. **Interactive elements**: Hover states, selection highlights
5. **Headers and text**: Any brand-colored text elements

## Data Models

No data model changes are required. The implementation relies entirely on existing DOM structure and CSS classes.

## Error Handling

### Browser Compatibility
- Fallback values will be provided for browsers that don't support `color-mix()`
- Alternative implementation using rgba/hsla values for older browsers

### Theme Switching
- Transparent colors will be defined for both light and dark themes
- Theme transitions will maintain smooth color changes

## Testing Strategy

### Visual Testing
1. **Cross-theme verification**: Test transparency in both light and dark modes
2. **Month navigation**: Verify transparency updates when navigating between months
3. **Element coverage**: Ensure all brand color elements are affected
4. **Contrast validation**: Verify text remains readable with transparency

### Browser Testing
1. **Modern browsers**: Chrome, Firefox, Safari, Edge
2. **Fallback testing**: Verify graceful degradation in older browsers

### Responsive Testing
1. **Mobile views**: Ensure transparency works on smaller screens
2. **Print styles**: Verify transparency doesn't affect print output

## Implementation Details

### CSS Structure
```css
:root {
    /* Existing brand colors */
    --brand-color: #23413e;
    --brand-primary: #23413e;
    --brand-secondary: #22c55f88;
    
    /* New transparent variants */
    --brand-color-transparent: color-mix(in srgb, var(--brand-color) 50%, transparent);
    --brand-primary-transparent: color-mix(in srgb, var(--brand-primary) 50%, transparent);
    --brand-secondary-transparent: color-mix(in srgb, var(--brand-secondary) 50%, transparent);
}

[data-theme="dark"] {
    /* Dark theme transparent variants */
    --brand-color-transparent: color-mix(in srgb, var(--brand-color) 50%, transparent);
    --brand-primary-transparent: color-mix(in srgb, var(--brand-primary) 50%, transparent);
    --brand-secondary-transparent: color-mix(in srgb, var(--brand-secondary) 50%, transparent);
}

/* Apply transparency to other-month days */
.month-day.other-month {
    border-color: var(--brand-color-transparent) !important;
}

.month-day.other-month .shift-card {
    border-color: var(--brand-color-transparent) !important;
}

/* Additional selectors for all brand color elements */
```

### Fallback Implementation
For browsers without `color-mix()` support:
```css
/* Fallback using rgba */
:root {
    --brand-color-transparent: rgba(35, 65, 62, 0.5);
    --brand-primary-transparent: rgba(35, 65, 62, 0.5);
}
```

### Performance Considerations
- CSS-only implementation ensures no JavaScript performance impact
- Uses existing DOM structure and classes
- Minimal CSS additions with high specificity for targeted overrides

## Integration Points

### Existing Systems
- **Theme system**: Integrates with existing light/dark theme switching
- **Month view rendering**: Works with existing month grid generation
- **CSS architecture**: Extends current CSS custom property system

### Future Extensibility
- New brand color elements will automatically inherit transparency
- Easy to adjust transparency percentage by modifying CSS variables
- Can be extended to other views (week view, etc.) if needed