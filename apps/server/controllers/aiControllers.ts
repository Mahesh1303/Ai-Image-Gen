import { prismaClient } from "db";
import { status, type Context } from "elysia";
import { TrainModel, GenerateImage, GeneratedImagesFromPack } from "common";
import { FalAiModel } from "../aiModels/falAiModel";
import { fal } from "@fal-ai/client";

const USER = "kjnsdadjsasjdsa";

const falAimodel = new FalAiModel();


// Training Model Loras
export const AiHandler = {
  handleTrainAi: async (ctx: Context) => {
    try {
      const ParsedBody = TrainModel.safeParse(ctx.body);
      if (!ParsedBody.success) {
        ctx.set.status = 400;
        return { message: "Invalid Credentials " };
      }
      const { name, type, age, ethnicity, zipUrl } = ParsedBody.data;
      const { request_id, response_url, status } = await falAimodel.trainModel(
        zipUrl,
        name
      );

      const data = await fal.queue.result("fal-ai/flux-lora-fast-training", {
        requestId: request_id,
      });

      console.log(data);
      const model = await prismaClient.model.create({
        data: {
          name,
          type,
          age,
          ethnicity,
          userId: USER,
          tensorPath : response_url
        },
      });

      ctx.set.status = 200;

      return {
        message: "AI training initiated Successfully",
        modelId: model.id
      };
    } catch (error) {
      ctx.set.status = 500;
      return {
        message: "Failed TO train the model",
      };
    }
  },



  //  Generating Images from Prompt and Model ID
  handleGenerateAi: async (ctx: Context) => {
    try {
      const parsedBody = GenerateImage.safeParse(ctx.body);
      if (!parsedBody.success) {
        ctx.set.status = 400;
        return { message: "Invalid Credentials" };
      }

      const { prompt, modelId } = parsedBody.data;

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
          status: status,
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


  // Generating Images from Pack ID
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
          status: "COMPLETED",
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


handleGetModels: async (ctx: Context) => {
  try {
    const result = await prismaClient.model.findMany({
      where: {
        userId: USER
      }
    });
    if(!result){
      ctx.set.status = 400;
      return {
        message : "Unable to fetch any models"
      }
    }
    ctx.set.status = 200;
    return {
      message : "Models fetched successfully",
      models : result
    }
  } catch (error) {
    ctx.set.status = 500;
    return {
      message : "Failed to fetch models Internal Server error"
    }
  }

},

    


  // Getting All Packs
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


  // Getting Generated Images
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




  // Webhook Handler for Modle training it will hit once the model training is completed and it will return a request id or say tensor path add this to model table's tensor path column
  // first check the ctx and add the relevant data 

  handleModelWebhook: async (ctx: Context) => {
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

  // Webhook Handler for Image generation it will hit once the image generation is completed and it will return a request id or say image path add this to generated images table's image column
  // first check the ctx and then add the relevant data 
  handleImageWebhook: async (ctx: Context) => {
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
