import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import ResumeUpload from "../ResumeUpload";
import { renderWithProviders } from "../../test/utils";

describe("Resume upload", () => {
  it("uploads an allowed file and reports that analysis is queued", async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<ResumeUpload />);
    const input = container.querySelector('input[type="file"]');
    expect(input).not.toBeNull();
    const resume = new File(["resume bytes"], "candidate.pdf", { type: "application/pdf" });
    await user.upload(input as HTMLInputElement, resume);
    await waitFor(() => expect(screen.getByText(/Analysis queued/i)).toBeInTheDocument());
    expect(screen.getByText(/^Uploaded successfully\. Analysis queued\.$/i)).toBeInTheDocument();
  });

  it("rejects unsupported types and oversized files before sending them", async () => {
    const user = userEvent.setup({ applyAccept: false });
    const { container } = renderWithProviders(<ResumeUpload />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, new File(["text"], "notes.txt", { type: "text/plain" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/Choose a PDF or DOCX/i);
    const tooLarge = new File([new Uint8Array(10 * 1024 * 1024 + 1)], "large.pdf", { type: "application/pdf" });
    await user.upload(input, tooLarge);
    expect(await screen.findByText(/exceeds the 10 MB limit/i)).toBeInTheDocument();
  });
});
