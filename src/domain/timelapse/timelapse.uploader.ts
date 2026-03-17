import { prisma } from "../../db/client.js";
import { timelapseUploadFailureCounter } from "../../observability/metrics.js";
import { YouTubeClient } from "../../adapters/youtube/client.js";

export class TimelapseUploader {
  constructor(private readonly youtubeClient: YouTubeClient) {}

  async upload(assetId: string): Promise<void> {
    const asset = await prisma.timelapseAsset.findUnique({ where: { id: assetId } });
    if (!asset || !asset.sourcePath) {
      return;
    }

    try {
      const result = await this.youtubeClient.uploadUnlisted(asset.sourcePath);
      await prisma.timelapseAsset.update({
        where: { id: assetId },
        data: {
          youtubeVideoId: result.videoId,
          youtubeUrl: result.url,
          uploadStatus: "uploaded"
        }
      });
    } catch {
      timelapseUploadFailureCounter.inc();
      await prisma.timelapseAsset.update({
        where: { id: assetId },
        data: { uploadStatus: "failed" }
      });
    }
  }
}
