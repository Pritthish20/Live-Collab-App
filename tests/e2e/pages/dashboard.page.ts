import { expect, type Page } from "@playwright/test";

export class DashboardPage {
  constructor(private readonly page: Page) {}

  async waitForLoaded() {
    await expect(
      this.page.getByRole("heading", { name: "Dashboard" })
    ).toBeVisible();
  }

  async createDocument(title: string) {
    await this.page.getByTestId("create-document-title").fill(title);
    await this.page.getByTestId("create-document-submit").click();
  }
}
