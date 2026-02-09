"use client";

import React from "react";
import Link from "next/link";

interface StructurePageWrapperProps {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Wraps entire /structure page content so any error (Breadcrumbs, viewer, form, etc.)
 * is caught here and we show a structure-specific fallback instead of the root error UI.
 */
export class StructurePageWrapper extends React.Component<
  StructurePageWrapperProps,
  State
> {
  constructor(props: StructurePageWrapperProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Structure page wrapper caught:", error?.message, info?.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <h1 className="text-xl font-semibold text-slate-900">3D Structure page error</h1>
          <p className="mt-2 text-slate-600">
            The page failed to load. Try again or go back.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => typeof window !== "undefined" && window.location.reload()}
              className="rounded-none border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Try again
            </button>
            <Link
              href="/structure"
              className="rounded-none border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Open structure page
            </Link>
            <Link
              href="/"
              className="rounded-none border border-teal-500 bg-teal-500 px-4 py-2 text-sm font-medium text-white hover:bg-teal-600"
            >
              Go home
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
