import { prismaClient } from "db";
import { status, type Context } from "elysia";
import { TrainModel, GenerateImage, GeneratedImagesFromPack } from "common";
import { FalAiModel } from "../aiModels/falAiModel";
import { fal } from "@fal-ai/client";

const USER = "kjnsdadjsasjdsa";

const falAimodel = new FalAiModel();
export const AiHandler = {
  handleTrainAi: async (ctx: Context) => {
    try {
      const ParsedBody = TrainModel.safeParse(ctx.body);
      if (!ParsedBody.success) {
        ctx.set.status = 400;
        return { message: "Invalid Credentials " };
      }
      const { name, type, age, ethnicity, images } = ParsedBody.data;
      const { request_id, response_url, status } = await falAimodel.trainModel(
        String(ParsedBody?.data?.images[0]),
        ParsedBody.data.name
      );

      const result = await prismaClient.model.create({
        data: {
          name,
          type,
          age,
          ethnicity,
          userId: USER,
          images: {
            create: images.map((url: string) => ({
              image: url,
            })),
          },
        },
      });

      ctx.set.status = 200;

      return {
        message: "AI training initiated Successfully",
        modelId: result.id,
      };
    } catch (error) {
      ctx.set.status = 500;
      return {
        message: "Failed TO train the model",
      };
    }
  },

  handleGenerateAi: async (ctx: Context) => {
    try {
      const parsedBody = GenerateImage.safeParse(ctx.body);
      if (!parsedBody.success) {
        ctx.set.status = 400;
        return { message: "Invalid Credentials" };
      }

      const { prompt, modelId } = parsedBody.data;

      // const { request_id, status, response_url }= falAimodel.generateImage(prompt:prompt,tensorPath=modelId)

      const { request_id, status, response_url } =
        await falAimodel.generateImage(prompt, modelId);
      const data = await fal.queue.result("fal-ai/flux-lora", {
        requestId: request_id,
      });

      console.log(data);
      console.log(data.data);
      const result = await prismaClient.generatedImages.create({
        data: {
          modelId,
          prompt,
          userId: USER,
          image: "",
          status: "pending",
        },
      });

      ctx.set.status = 200;
      return {
        message: "Images Generating Succesfully",
        imageID: result.id,
      };
    } catch (error) {
      ctx.set.status = 500;
      return {
        message: "Failed TO Generate Model Internal Server Error",
      };
    }
  },

  handlePackGenerate: async (ctx: Context) => {
    try {
      const parsedBody = GeneratedImagesFromPack.safeParse(ctx.body);
      if (!parsedBody.success) {
        ctx.set.status = 400;
        return {
          message: "Invalid Credentials",
        };
      }

      const { packId, modelId } = parsedBody.data;

      const prompts = await prismaClient.prompts.findMany({
        where: {
          packId: packId,
        },
      });

      const result = await prismaClient.generatedImages.createManyAndReturn({
        data: prompts.map((prompt) => ({
          prompt: prompt.prompt,
          modelId,
          userId: USER,
          image: "",
          status: "pending",
        })),
      });

      ctx.set.status = 200;
      return {
        message: "Images Generated Successfully",
        images: result.map((img) => {
          img.id;
        }),
      };
    } catch (error) {
      ctx.set.status = 500;
      return {
        message: "Failed TO generate PAck Internal Server Errror",
      };
    }
  },

  handleGetPacks: async (ctx: Context) => {
    try {
      const result = await prismaClient.packs.findMany({});
      if (!result) {
        ctx.set.status = 400;
        return {
          message: "Unable to fetch any packs",
        };
      }
      ctx.set.status = 200;
      return {
        message: "Packs fetched successfully",
        packs: result,
      };
    } catch (error) {
      ctx.set.status = 500;
      return {
        message: "Failed to fetch packs Internal Server error",
      };
    }
  },

  handleGetImage: async (ctx: Context) => {
    let img: string[] = [];

    if (typeof ctx.query.images === "string" && ctx.query.images.trim()) {
      img = ctx.query.images.split(",").filter((id) => id.trim());
    } else if (Array.isArray(ctx.query.images)) {
      img = ctx.query.images.filter((id) => id && id.trim());
    }

    const limit = parseInt(ctx.query.limit ?? "10");
    const offset = parseInt(ctx.query.offset ?? "0");

    console.log(img);
    const whereClause: any = { userId: USER };
    if (img.length > 0) {
      whereClause.id = { in: img };
    }

    const imagesData = await prismaClient.generatedImages.findMany({
      where: whereClause,
      skip: offset,
      take: limit,
    });

    ctx.set.status = 200;

    return {
      images: imagesData,
    };
  },

  handleWebhook: async (ctx: Context) => {
    try {
      const body = ctx.body;
      console.log("Webhook received:", body);
      ctx.set.status = 200;
      return { message: "Webhook processed successfully" };
    } catch (error) {
      ctx.set.status = 500;
      return { message: "Failed to process webhook" };
    }
  },
};
