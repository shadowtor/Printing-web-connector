export interface YouTubeUploadResult {
  videoId: string;
  url: string;
}

export class YouTubeClient {
  async uploadUnlisted(_sourcePath: string): Promise<YouTubeUploadResult> {
    // Placeholder implementation. This is intentionally a no-op stub until API credentials are wired.
    return {
      videoId: "stub-video-id",
      url: "https://youtube.com/watch?v=stub-video-id"
    };
  }
}
