import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 md:p-12 flex flex-col items-center justify-center text-center max-w-lg mx-auto min-h-[400px]">
          <div className="w-16 h-16 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            Ushbu sahifada xatolik yuz berdi
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            {this.state.error?.message || "Kutilmagan xatolik yuz berdi. Qayta urinib ko'ring."}
          </p>
          <div className="flex gap-3">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
            >
              <RefreshCw size={14} />
              Qayta urinish
            </button>
            {this.props.goToHome && (
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  this.props.goToHome();
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
              >
                <Home size={14} />
                Bosh sahifa
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
