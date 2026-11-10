import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import ToastProvider from "../ToastProvider";
import { server } from "../../mocks/server";

function CurrentPath() {
  const location = useLocation();
  return <output aria-label="Current route">{location.pathname}{location.search}</output>;
}

function renderNavigation(ui: React.ReactNode, route = "/dashboard") {
  return render(<MemoryRouter initialEntries={[route]}><ToastProvider>{ui}<CurrentPath /></ToastProvider></MemoryRouter>);
}

describe("Navigation actions", () => {
  it("submits candidate search and opens profile settings", async () => {
    const user = userEvent.setup();
    renderNavigation(<Navbar />);
    const search = screen.getByRole("textbox", { name: /Search candidates/i });
    await user.type(search, "Data Engineer");
    await user.keyboard("{Enter}");
    expect(screen.getByLabelText("Current route")).toHaveTextContent("/dashboard/candidates?search=Data%20Engineer");
    await user.click(screen.getByRole("button", { name: /Open profile settings for/i }));
    expect(screen.getByLabelText("Current route")).toHaveTextContent("/dashboard/settings");
  });

  it("logs out and clears local session details after server revocation", async () => {
    const user = userEvent.setup();
    localStorage.setItem("token", "access");
    localStorage.setItem("refresh_token", "refresh");
    localStorage.setItem("userFirstName", "Morgan");
    server.use(http.post("*/api/v1/auth/logout", () => HttpResponse.json({ status: "success" })));
    renderNavigation(<Sidebar />);
    await user.click(screen.getByRole("button", { name: /Logout/i }));
    await waitFor(() => expect(screen.getByLabelText("Current route")).toHaveTextContent("/login"));
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("refresh_token")).toBeNull();
    expect(await screen.findByText(/You have been logged out/i)).toBeInTheDocument();
  });

  it("still signs out locally when server revocation fails", async () => {
    const user = userEvent.setup();
    localStorage.setItem("token", "access");
    localStorage.setItem("refresh_token", "refresh");
    server.use(http.post("*/api/v1/auth/logout", () => HttpResponse.json({ detail: "offline" }, { status: 503 })));
    renderNavigation(<Sidebar />);
    await user.click(screen.getByRole("button", { name: /Logout/i }));
    await waitFor(() => expect(screen.getByLabelText("Current route")).toHaveTextContent("/login"));
    expect(await screen.findByText(/server session could not be revoked/i)).toBeInTheDocument();
  });

  it("supports a mobile sidebar close button and closes after navigation", async () => {
    const user = userEvent.setup();
    const setOpen = vi.fn();
    renderNavigation(<Sidebar isOpen setIsOpen={setOpen} />);
    await user.click(screen.getByRole("button", { name: /Close navigation/i }));
    expect(setOpen).toHaveBeenCalledWith(false);
    await user.click(screen.getByRole("link", { name: /Candidates/i }));
    expect(setOpen).toHaveBeenCalledWith(false);
    expect(screen.getByLabelText("Current route")).toHaveTextContent("/dashboard/candidates");
  });
});
