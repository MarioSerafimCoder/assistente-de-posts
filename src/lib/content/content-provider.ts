import type { ContentProviderId, StructureContentRequest, StructuredPost } from "@/types/content";

export interface ContentProvider {
  id: ContentProviderId;
  name: string;
  isAvailable(): Promise<boolean>;
  structureContent(request: StructureContentRequest): Promise<StructuredPost>;
}

export class ContentProviderUnavailableError extends Error {
  readonly code = "CONTENT_PROVIDER_UNAVAILABLE";
  constructor(readonly provider: ContentProviderId, message: string) {
    super(message);
    this.name = "ContentProviderUnavailableError";
  }
}

export class ContentStructureError extends Error {
  readonly code = "CONTENT_STRUCTURE_FAILED";
  constructor(readonly provider: ContentProviderId, message: string, readonly cause?: unknown) {
    super(message);
    this.name = "ContentStructureError";
  }
}
