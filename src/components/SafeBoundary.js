"use client";

import { Component } from "react";

/**
 * SafeBoundary
 *
 * A small error boundary used around the WebGL Canvas. If anything inside
 * throws (WebGL not supported, three.js API mismatch, hydration error)
 * we render the provided fallback instead of letting the error blow up
 * the whole `<main>` tree.
 *
 * React 19 still uses class components for error boundaries — there is no
 * hook equivalent.
 */
export default class SafeBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Surface in the dev console so we can fix the underlying bug, but
    // never tear down the page.
    if (typeof console !== "undefined") {
      // eslint-disable-next-line no-console
      console.error("[SafeBoundary] caught:", error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}
