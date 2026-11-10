import { beforeEach, describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import apiClient from "../client";
import { server } from "../../mocks/server";

describe("API authentication and error handling", () => {
  beforeEach(() => localStorage.clear());
  it("attaches the current access token to requests", async () => {
    localStorage.setItem("token", "test-access-token");
    let authorization = "";
    server.use(http.get("*/api/v1/probe", ({ request }) => {
      authorization = request.headers.get("authorization") || "";
      return HttpResponse.json({ ok: true });
    }));
    await apiClient.get("/probe");
    expect(authorization).toBe("Bearer test-access-token");
  });

  it("rotates an expired session token once and retries the request", async () => {
    localStorage.setItem("token", "expired-access-token");
    localStorage.setItem("refresh_token", "valid-refresh-token");
    server.use(
      http.post("*/api/v1/auth/refresh", () => HttpResponse.json({ access_token: "new-access-token", refresh_token: "new-refresh-token", token_type: "bearer" })),
      http.get("*/api/v1/probe", ({ request }) => request.headers.get("authorization") === "Bearer new-access-token"
        ? HttpResponse.json({ ok: true })
        : HttpResponse.json({ detail: "expired" }, { status: 401 })),
    );
    const response = await apiClient.get("/probe");
    expect(response.data.ok).toBe(true);
    expect(localStorage.getItem("token")).toBe("new-access-token");
    expect(localStorage.getItem("refresh_token")).toBe("new-refresh-token");
  });

  it("clears local credentials when token rotation fails", async () => {
    localStorage.setItem("token", "expired-access-token");
    localStorage.setItem("refresh_token", "invalid-refresh-token");
    server.use(
      http.post("*/api/v1/auth/refresh", () => HttpResponse.json({ detail: "expired" }, { status: 401 })),
      http.get("*/api/v1/probe", () => HttpResponse.json({ detail: "expired" }, { status: 401 })),
    );
    const expired = vi.fn();
    window.addEventListener("hirelens:session-expired", expired, { once: true });
    await expect(apiClient.get("/probe")).rejects.toMatchObject({ response: { status: 401 } });
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("refresh_token")).toBeNull();
    expect(expired).toHaveBeenCalledOnce();
  });

  it("announces forbidden responses and expires stale access tokens", async () => {
    server.use(http.post("*/api/v1/auth/login", () => HttpResponse.json({ access_token: "fresh", refresh_token: "refresh", token_type: "bearer" })));
    await apiClient.post("/auth/login", {});
    server.use(http.get("*/api/v1/probe", () => HttpResponse.json({ detail: "forbidden" }, { status: 403 })));
    const denied = vi.fn();
    window.addEventListener("hirelens:access-denied", denied, { once: true });
    await expect(apiClient.get("/probe")).rejects.toMatchObject({ response: { status: 403 } });
    expect(denied).toHaveBeenCalledOnce();

    localStorage.setItem("token", "expired-access-token");
    server.use(http.get("*/api/v1/probe", () => HttpResponse.json({ detail: "expired" }, { status: 401 })));
    const expired = vi.fn();
    window.addEventListener("hirelens:session-expired", expired, { once: true });
    await expect(apiClient.get("/probe")).rejects.toMatchObject({ response: { status: 401 } });
    expect(localStorage.getItem("token")).toBeNull();
    expect(expired).toHaveBeenCalledOnce();
  });
});
