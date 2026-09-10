# Code Review: P14-news-timeline

## Executive Summary
Overall, the project is a lightweight, responsive frontend tool with solid foundational architecture. Security against XSS is handled well through `textContent`, and privacy features are well-communicated. The use of native web APIs and zero dependencies keeps the project maintainable.

However, there are significant functional discrepancies (such as missing double-click editing), accessibility anti-patterns (incorrect `aria-label`s overriding Chinese text), and service worker caching logic mismatches that need to be addressed.

---

## Findings

### CRITICAL

**1. Service Worker Caching Strategy Destructive Cache Clearing**
- **File**: `sw.js` (activate event)
- **Impact**: The `caches.delete` sweeps the entire origin for any cache not named exactly `journalism-tool-v1`. This will incorrectly delete caches for all other tools on the same domain, breaking their offline functionality.
- **Fix Suggestion**: Scope the `CACHE_NAME` uniquely (e.g., `journalism-tool-p14-v1`) and only delete old caches that start with `journalism-tool-p14-`.

### HIGH

**1. Misleading UI Copy / Missing Feature: Double-click to Edit**
- **File**: `app.js` (line 111)
- **Impact**: The "Add Event" (`addBtn`) button generates a new timeline event with the placeholder text "双击此处编辑描述" (Double-click here to edit description). However, there is no double-click event listener implemented in the DOM nodes to facilitate inline editing. Users will be confused when they double-click the event in the UI and nothing happens.
- **Fix Suggestion**: Implement inline editing via `contenteditable` or a double-click event listener that replaces the text with an `input`/`textarea`. Alternatively, change the placeholder text to "在上方 JSON 区域编辑描述" (Edit description in the JSON area above) to accurately reflect the current functionality.

**2. Accessibility (a11y) Anti-pattern: English `aria-label` on Chinese Text**
- **File**: `index.html` (lines 49-51)
- **Impact**: Screen readers prioritize `aria-label` over visible text content. Important action buttons have labels like `aria-label="render"`, while their visible text is "渲染时间线". Chinese users relying on assistive technologies will hear English words ("render", "add", "export") instead of the local language, causing severe accessibility friction and breaking WCAG compliance. Also, the `aria-label="导出 PNG"` duplicates visible text and causes the print CSS `button[aria-label]` selector to improperly hide the button.
- **Fix Suggestion**: Remove the `aria-label` attribute entirely from these buttons.

### MEDIUM

**1. Service Worker Caching Strategy Mismatch**
- **File**: `sw.js` (lines 53-55)
- **Impact**: The comment block explicitly states a caching strategy that does not match the implementation. The early return for cross-origin skips the service worker.
- **Fix Suggestion**: If external API caching is required, implement a `fetch` handler that intercepts external requests, attempts the network call, and caches the response. If external caching is out of scope, update the documentation comment to accurately reflect that only same-origin requests are handled.

**2. Test Coverage Gaps**
- **File**: Entire Repository
- **Impact**: There are no automated tests (e.g., Jest, Playwright). The `QA.md` mentions functional testing, but it appears to be manual. Any changes to parsing logic, DOM generation, or date sorting could silently break core features without automated verification.
- **Fix Suggestion**: Add a basic test suite. For a vanilla JS app, setting up Jest for unit testing logic (like sorting) and Playwright for e2e testing the "Add Event" and "Export" workflows is recommended.

### LOW

**1. Dead Code: Unused `escapeHtml` Function**
- **File**: `app.js` (lines 28-30)
- **Impact**: The function `escapeHtml` is defined but never called. Text injection is handled safely via `document.createElement` and `textContent`, making this function redundant.
- **Fix Suggestion**: Remove the `escapeHtml` function to reduce dead code and improve maintainability.

**2. Performance: DOM Repaints Inside Loop**
- **File**: `app.js` (lines 37-67)
- **Impact**: In `renderTimeline`, nodes are iteratively appended directly to `timelineEl` inside a `.forEach()` loop (`timelineEl.appendChild(article);`). For a large number of events, this triggers excessive DOM repaints.
- **Fix Suggestion**: Use a `DocumentFragment`. Append all created `article` elements to the fragment in the loop, and then append the fragment to `timelineEl` in a single DOM operation.

**3. PWA Manifest: Data URI for Icon**
- **File**: `manifest.json` (lines 9-11)
- **Impact**: The `src` of the icon in `manifest.json` is a `data:image/svg+xml` URI. While technically valid, some older browsers and OS-level PWA installers struggle with parsing data URIs in manifests, which can result in a missing home screen icon.
- **Fix Suggestion**: Extract the SVG into a physical file (e.g., `icon.svg`), place it in the project, and reference it via a relative URL (`"src": "./icon.svg"`).
