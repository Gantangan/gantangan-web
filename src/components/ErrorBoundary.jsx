import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    // eslint-disable-next-line no-console
    console.error("Render error tertangkap ErrorBoundary:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-6 text-center text-cream">
          <div className="text-3xl">⚠️</div>
          <h1 className="font-display text-lg font-bold">Ada yang tidak beres</h1>
          <p className="max-w-xs text-sm text-muted">
            Halaman gagal dimuat, kemungkinan ada versi baru web ini. Coba muat ulang halamannya.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-full bg-gold px-6 py-2.5 text-sm font-bold text-ink hover:brightness-95"
          >
            Muat Ulang
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
