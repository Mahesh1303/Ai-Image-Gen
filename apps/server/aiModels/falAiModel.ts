import { BaseModel } from "./baseModel";
import { fal } from "@fal-ai/client";

export class FalAiModel extends BaseModel {
  constructor() {
    super();
  }

   async generateImage(prompt: string, tensorPath: string) {
    const {request_id, response_url, status} =await fal.queue.submit("fal-ai/flux-lora", {
      input: {
        prompt: prompt,
        loras: [{ path: tensorPath, scale: 1 }],
      },
    });
    return {request_id,status,response_url};
  }
  

  async trainModel(zipUrl: string, triggeredWord: string) {
    const { request_id, response_url , status} = await fal.queue.submit(
      "fal-ai/flux-lora-fast-training",
      {
        input: {
          images_data_url: zipUrl,
          trigger_word: triggeredWord
        },
        webhookUrl: `${process.env.FAL_WEBHOOK_URL}/webhook`,
      }
    );

    return {request_id,response_url, status}
  }
}
