import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[3D Render Error]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0a0a0f',
          }}
        >
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              stroke="var(--accent-red, #ff5252)"
              strokeWidth="1.5"
              style={{ margin: '0 auto 1rem' }}
            >
              <circle cx="24" cy="24" r="20" />
              <line x1="16" y1="16" x2="32" y2="32" />
              <line x1="32" y1="16" x2="16" y2="32" />
            </svg>
            <p
              style={{
                color: 'var(--text-primary, #e0e0e0)',
                fontSize: '1.125rem',
                fontWeight: 500,
                marginBottom: '0.5rem',
              }}
            >
              Something went wrong with 3D rendering
            </p>
            <p
              style={{
                color: 'var(--text-secondary, #9e9e9e)',
                fontSize: '0.875rem',
                marginBottom: '1.5rem',
              }}
            >
              An unexpected error occurred in the WebGL canvas.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '0.5rem 1.5rem',
                background: 'transparent',
                border: '1px solid var(--border, #2a2a3e)',
                borderRadius: '6px',
                color: 'var(--accent-blue, #4fc3f7)',
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.borderColor = 'var(--accent-blue, #4fc3f7)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.borderColor = 'var(--border, #2a2a3e)';
              }}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
