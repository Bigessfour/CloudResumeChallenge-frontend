import { expect, test } from "@playwright/test";

test("homepage shows recruiter signal and three featured projects", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveText("Stephen McKitrick");
  await expect(page.locator(".hero-tagline")).toContainText("transitioning into cloud and DevOps");
  await expect(page.getByRole("heading", { name: "Featured Projects" })).toBeVisible();
  const featured = page.locator("#projects");
  await expect(featured.getByText("Town of Wiley Website", { exact: true })).toBeVisible();
  await expect(featured.getByText("BusBuddy", { exact: true })).toBeVisible();
  await expect(
    featured.getByText("Cloud Resume Challenge Portfolio", { exact: true })
  ).toBeVisible();
  await expect(page.locator(".hero-actions a[href$='stephen-mckitrick-resume.pdf']")).toBeVisible();
});

test("visitor pill falls back to Demo when the API URL is unset", async ({ page }) => {
  await page.route("**/js/config.js", (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: 'window.VISITOR_API_CONFIG = { url: "" };\n',
    })
  );
  await page.goto("/");
  await expect(page.locator("#visitor-counter")).toContainText("Demo (local preview)", {
    timeout: 8000,
  });
});

test("blog and printable resume pages load", async ({ page }) => {
  await page.goto("/blog.html");
  await expect(page.locator("h1")).toContainText("serverless resume");
  await page.goto("/resume.html");
  await expect(page.locator("h1")).toHaveText("Stephen McKitrick");
  await expect(page.locator("body")).toContainText("BusBuddy");
});

test("site HTML does not advertise dead or private project URLs", async ({ request }) => {
  const html = await request.get("/");
  const body = await html.text();
  expect(body).not.toMatch(/d1imxsgur21071|BusBuddy-3|github.com\/Bigessfour\/aico-echo/);
  expect(body).toContain("demo not live");
});
