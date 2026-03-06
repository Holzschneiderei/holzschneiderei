import { Component } from "react";
import { DEFAULT_FORM } from "../../data/constants";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[Holzschneiderei] Unhandled error:", error, info.componentStack);
  }

  handleRestart = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="min-h-screen flex items-center justify-center p-6 font-body text-text bg-[var(--wz-bg,transparent)]">
          <div className="text-center max-w-[400px]">
            <div className="text-4xl mb-4 opacity-60" aria-hidden="true">⚠️</div>
            <h1 className="text-xl font-bold tracking-normal uppercase mb-2">
              Etwas ist schiefgelaufen
            </h1>
            <p className="text-sm text-muted leading-relaxed mb-6">
              Der Konfigurator hat einen unerwarteten Fehler festgestellt.
              Bitte versuchen Sie es erneut.
            </p>
            {this.state.error && (
              <details className="text-left mb-6 bg-field border border-border rounded p-3">
                <summary className="text-xs text-muted cursor-pointer select-none">
                  Technische Details
                </summary>
                <pre className="text-[11px] text-error mt-2 whitespace-pre-wrap break-all">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <button
              className="wz-btn wz-btn-primary h-[46px] px-8 text-sm"
              onClick={this.handleRestart}
            >
              Neu starten
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
