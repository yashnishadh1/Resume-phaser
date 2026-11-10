import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import ToastProvider, { useToast } from "../ToastProvider";
import { notify } from "../../lib/notifications";

function ToastControls() {
  const toast = useToast();
  return <><button onClick={() => toast("Saved successfully", "success")}>Show success</button><button onClick={() => toast("Please retry", "error")}>Show error</button></>;
}

describe("Toast notifications", () => {
  it("announces success and error messages and lets the user dismiss them", async () => {
    const user = userEvent.setup();
    render(<ToastProvider><ToastControls /></ToastProvider>);
    await user.click(screen.getByRole("button", { name: "Show success" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Saved successfully");
    await user.click(screen.getByRole("button", { name: "Dismiss notification" }));
    expect(screen.queryByText("Saved successfully")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Show error" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Please retry");
  });

  it("accepts notifications from the application event helper", async () => {
    render(<ToastProvider><p>Application</p></ToastProvider>);
    act(() => notify("Session expired", "error"));
    expect(await screen.findByRole("alert")).toHaveTextContent("Session expired");
  });
});
