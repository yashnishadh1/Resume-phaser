import { Component, type ReactNode } from "react";
import ServerError from "@/pages/ServerError";

interface ErrorBoundaryProps { children: ReactNode }
interface ErrorBoundaryState { hasError: boolean }

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch() {
    // Keep implementation details out of the user interface.
  }

  render() {
    return this.state.hasError ? <ServerError /> : this.props.children;
  }
}
