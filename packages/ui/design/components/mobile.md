---
type: component-platform
owner: ponti-studios
platform: ios-android
status: canonical
---

# Mobile Components

Mobile components implement the [shared component contract](shared.md) through native interaction conventions. Native is a first-class platform, not a visual source of truth that every other platform must imitate.

## Native expression

Use the strengths of the host platform deliberately:

- iOS may use native navigation, sheets, gestures, Dynamic Type, and system typography behavior.
- Android may use native navigation, back behavior, snackbars, and Compose conventions.
- Haptics, system permissions, and device capabilities may supplement visual feedback.
- Gestures may replace visible controls only when an accessible alternative remains available.
- Native surfaces may differ in radius, blur, and elevation while retaining the same semantic role.

## Native requirements

- Preserve a minimum 44×44pt target.
- Respect platform accessibility settings, including reduced motion and Dynamic Type.
- Preserve system back behavior and provide a clear dismissal path for transient surfaces.
- Never rely on color alone for state.
- Use native controls when they provide meaningful system integration or accessibility benefits.
- Keep content hierarchy, state language, and behavioral intent aligned with web components.

A sheet, dialog, field, or navigation pattern may use different platform mechanics. The user should still understand the same purpose, consequence, and next action.
