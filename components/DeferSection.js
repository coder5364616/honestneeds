'use client';

import styled from 'styled-components';

/**
 * Wraps a below-the-fold landing section and lets the browser skip its
 * rendering work (layout + paint) while it is off-screen, via the native
 * `content-visibility` property.
 *
 * Why not JS lazy-mounting: removing sections from SSR / mounting them on scroll
 * left the page with almost nothing in the initial HTML, so a cold load had to
 * download + execute many chunks before the page became interactive — which froze
 * scrolling for a while. `content-visibility` keeps every section server-rendered
 * and in the DOM (so the page is fully scrollable from the first paint), yet the
 * browser still avoids painting off-screen content and running its infinite CSS
 * animations — which is what removes the scroll lag/jank.
 *
 * `contain-intrinsic-size: auto <h>` reserves an estimated height up front (so the
 * scrollbar doesn't jump) and then remembers each section's real size after it is
 * rendered once.
 */
const DeferSection = styled.div`
  content-visibility: auto;
  contain-intrinsic-size: auto ${({ $minHeight = 600 }) => $minHeight}px;
`;

export default DeferSection;
