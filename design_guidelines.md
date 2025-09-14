# Design Guidelines: OnePageMore Channel Points Web App

## Design Approach
**Selected Approach**: Gaming-inspired dark theme with OnePageMore branding
**Justification**: This is a utility-focused application for livestream management that requires clear information hierarchy, consistent patterns, and scalable modularity. The dark purple/gray gradient theme provides excellent visual appeal while maintaining OnePageMore's brand identity for the gaming/streaming community.

## Core Design Elements

### A. Color Palette
**Primary Colors**:
- Light mode: 263 85% 47% (deep purple-blue for streaming theme)
- Dark mode: 263 75% 65% (lighter variant for contrast)

**Secondary Colors**:
- Light mode: 220 15% 96% (neutral background)
- Dark mode: 220 15% 12% (dark background)

**Accent Color**: 45 100% 60% (gold for point values and achievements)

**Status Colors**:
- Success: 142 70% 45% (point gains)
- Warning: 38 95% 55% (low balance alerts)
- Error: 348 85% 55% (insufficient points)

### B. Typography
**Primary Font**: Inter (Google Fonts)
- Headers: 600-700 weight
- Body text: 400-500 weight
- Point values/numbers: 600 weight tabular-nums

**Hierarchy**:
- H1: 2rem (dashboard titles)
- H2: 1.5rem (section headers)
- H3: 1.25rem (card titles)
- Body: 1rem
- Small: 0.875rem (metadata)

### C. Layout System
**Spacing Units**: Tailwind 2, 4, 6, 8, 12, 16
- Component padding: p-4, p-6
- Section margins: m-8, m-12
- Card spacing: gap-4, gap-6
- Container max-width: max-w-6xl

### D. Component Library

**Navigation**:
- Top navigation bar with user avatar and point balance display
- Sidebar navigation for admin functions (collapsible on mobile)

**Dashboard Cards**:
- Point balance card with large, prominent number display
- Recent transactions list with clear iconography
- Quick stats cards (total earned, total redeemed)

**Reward System**:
- Grid layout for reward catalog
- Card-based design with point cost prominently displayed
- Clear redemption status indicators
- Modular reward configuration forms for admin

**Forms**:
- Clean, minimal input fields with Material Design styling
- Clear validation states
- Action buttons with loading states for point operations

**Data Displays**:
- Transaction history table with filtering options
- User management table for admin functions
- Point transfer interface with user search

**Modals/Overlays**:
- Redemption confirmation dialogs
- Reward configuration modals for admin
- Point transfer confirmation overlays

### E. Animations
**Minimal Approach**:
- Subtle hover effects on interactive elements
- Loading spinners for API operations
- Success/error toast notifications with slide-in animation
- Point balance number counting animation for updates

## Key Design Principles

1. **Information Hierarchy**: Point balances and key actions are visually prominent
2. **Gaming Context**: Use gaming-inspired iconography and terminology while maintaining professional clarity
3. **Modularity**: Admin interfaces for reward configuration should feel intuitive and extensible
4. **Real-time Feedback**: Clear visual feedback for all point operations and redemptions
5. **Mobile Responsive**: Ensure all functionality works well on mobile devices for streamers managing on-the-go

## Accessibility Considerations
- High contrast ratios for all text/background combinations
- Consistent dark mode implementation across all components
- Clear focus indicators for keyboard navigation
- Screen reader friendly labels for point values and transaction data