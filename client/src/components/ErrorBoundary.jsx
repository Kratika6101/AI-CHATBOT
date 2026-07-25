import React, { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('UI Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center bg-white dark:bg-slate-950">
          <p className="text-sm font-medium text-red-600">Something went wrong</p>
          <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">UI Error</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 rounded-xl bg-maroon-600 px-6 py-3 text-sm font-semibold text-white hover:bg-maroon-700"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}