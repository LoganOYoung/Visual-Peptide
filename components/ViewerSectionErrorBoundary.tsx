"use client";

import React from "react";

interface ViewerSectionErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Catches errors in the viewer section (metadata + 3D viewer) so the page
 * still shows the form and quick-load links instead of the route error UI.
 */
export class ViewerSectionErrorBoundary extends React.Component<
  ViewerSectionErrorBoundaryProps,
  State
> {
  constructor(props: ViewerSectionErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Viewer section error:", error?.message, info?.componentStack);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
