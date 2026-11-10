import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Landing from "../Landing";
import PrivacyPolicy from "../PrivacyPolicy";
import TermsAndConditions from "../TermsAndConditions";
import Contact from "../Contact";
import NotFound from "../NotFound";
import AccessDenied from "../AccessDenied";
import Unauthorized from "../Unauthorized";
import ServerError from "../ServerError";
import { renderWithProviders } from "../../test/utils";

describe("Public, legal and error pages", () => {
  it("shows the HireLens landing page and functional footer links", () => {
    renderWithProviders(<Landing />);
    expect(screen.getByRole("heading", { name: /See Your Potential/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Privacy Policy/i })).toHaveAttribute("href", "/privacy-policy");
    expect(screen.getByRole("link", { name: /Terms & Conditions/i })).toHaveAttribute("href", "/terms-and-conditions");
    expect(screen.getByText(new RegExp(`© ${new Date().getFullYear()} HireLens`))).toBeInTheDocument();
  });

  it("renders the privacy policy with its data handling and review notice", () => {
    renderWithProviders(<PrivacyPolicy />);
    expect(screen.getByRole("heading", { name: "Privacy Policy" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Resume and document processing/i })).toBeInTheDocument();
    expect(screen.getByText(/legal review before production use/i)).toBeInTheDocument();
  });

  it("renders terms, contact and account recovery information", () => {
    const terms = renderWithProviders(<TermsAndConditions />);
    expect(screen.getByRole("heading", { name: /Terms and Conditions/i })).toBeInTheDocument();
    terms.unmount();
    renderWithProviders(<Contact />);
    expect(screen.getByRole("heading", { name: /Contact HireLens/i })).toBeInTheDocument();
  });

  it("renders a friendly 404 and keeps dashboard navigation for signed-in users", () => {
    localStorage.removeItem("token");
    const view = renderWithProviders(<NotFound />);
    expect(screen.getByText("404 error")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Go to Dashboard/i })).not.toBeInTheDocument();
    view.unmount();
    localStorage.setItem("token", "test-token");
    renderWithProviders(<NotFound />);
    expect(screen.getByRole("link", { name: /Go to Dashboard/i })).toHaveAttribute("href", "/dashboard");
  });

  it("renders distinct unauthorized, access denied and server error states", () => {
    const unauthorized = renderWithProviders(<Unauthorized />);
    expect(screen.getByText(/401 · Sign in required/i)).toBeInTheDocument();
    unauthorized.unmount();
    const accessDenied = renderWithProviders(<AccessDenied />);
    expect(screen.getByText(/403 · Access denied/i)).toBeInTheDocument();
    accessDenied.unmount();
    renderWithProviders(<ServerError />);
    expect(screen.getByText(/500 · Service error/i)).toBeInTheDocument();
  });
});
