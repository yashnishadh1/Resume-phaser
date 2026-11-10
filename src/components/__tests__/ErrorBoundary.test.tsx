import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import ErrorBoundary from "../ErrorBoundary";
import ToastProvider from "../ToastProvider";

function CrashingChild(): never {
  throw new Error("private backend detail");
}

describe("ErrorBoundary", () => {
  afterEach(() => vi.restoreAllMocks());

  it("shows a safe HireLens error page when a child throws", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    render(<MemoryRouter><ToastProvider><ErrorBoundary><CrashingChild /></ErrorBoundary></ToastProvider></MemoryRouter>);
    expect(screen.getByText(/500 · Service error/i)).toBeInTheDocument();
    expect(screen.queryByText(/private backend detail/i)).not.toBeInTheDocument();
  });
});
