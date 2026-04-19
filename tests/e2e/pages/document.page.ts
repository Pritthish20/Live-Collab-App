import { expect, type Page } from "@playwright/test";

export class DocumentPage {
  constructor(private readonly page: Page) {}

  get titleInput() {
    return this.page.getByTestId("editor-document-title");
  }

  get editor() {
    return this.page.getByTestId("document-editor");
  }

  get editorSurface() {
    return this.page.getByTestId("document-editor-surface");
  }

  async waitForLoaded() {
    await expect(this.titleInput).toBeVisible();
    await expect(this.editor).toBeVisible();
    await expect(this.editorSurface).toBeVisible();
  }

  async waitForRealtimeReady() {
    await expect(this.page.getByText("Connection: Connected")).toBeVisible();
  }

  async typeInEditor(text: string) {
    await this.editorSurface.click();
    await this.page.keyboard.type(text);
  }

  async expectEditorText(text: string) {
    await expect(this.editor).toContainText(text);
  }
}
