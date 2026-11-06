"use client";

import { Component, type ReactNode } from "react";

/** Swaps a 3D scene for `fallback` when WebGL is unavailable. */
export class WebGLBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
