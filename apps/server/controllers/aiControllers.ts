import { prismaClient } from "db";
import {  status, type Context } from "elysia";
import { TrainModel, GenerateImage, GeneratedImagesFromPack } from "common";
import { FalAiModel } from "../aiModels/falAiModel";

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

      const model = await prismaClient.model.create({
        data: {
          name,
          type,
          age,
          ethnicity,
          userId: USER,
          falAiModelRequestId: request_id,
          status: status,
        },
      });

      ctx.set.status = 200;

      return {
        message: "AI training initiated Successfully",
        modelId: model.id,
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

      const model = await prismaClient.model.findUnique({
        where: {
          id: modelId,
        },
      });
      if (!model || !model.tensorPath) {
        ctx.set.status = 400;
        return {
          message: "No Model Available",
        };
      }

      const { request_id, status, response_url } =
        await falAimodel.generateImage(prompt, model?.tensorPath);

      const result = await prismaClient.generatedImages.create({
        data: {
          modelId: model?.id,
          prompt,
          userId: USER,
          image: "",
          status: status,
          falAiImageRequestId: request_id,
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
      
     
      const model = await prismaClient.model.findFirst({
        where:{
          id:modelId
        }
      })

      if (!model) {
        ctx.set.status=400
    return {
      message:"No Model Present"
    };
  }
  const prompts = await prismaClient.prompts.findMany({
    where: {
      packId: packId,
    },
  });

    let requestIds:{request_id: string, status:string}[] = await Promise.all(
      prompts.map(prompt =>
        
        falAimodel.generateImage(prompt.prompt,model.tensorPath))
    ) 


      const result = await prismaClient.generatedImages.createManyAndReturn({
        data: prompts.map((prompt,index) => ({
          prompt: prompt.prompt,
          modelId,
          userId: USER,
          image: "",
          status:requestIds[index]?.status,
          falAiImageRequestId:requestIds[index]?.request_id
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

  //  Getting All Models
  handleGetModels: async (ctx: Context) => {
    try {
      const result = await prismaClient.model.findMany({
        where: {
          userId: USER,
        },
      });
      if (!result) {
        ctx.set.status = 400;
        return {
          message: "Unable to fetch any models",
        };
      }
      ctx.set.status = 200;
      return {
        message: "Models fetched successfully",
        models: result,
      };
    } catch (error) {
      ctx.set.status = 500;
      return {
        message: "Failed to fetch models Internal Server error",
      };
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
      console.log(
        "====================Received training webhook===================="
      );
      const body = ctx.body;
      const requestId = body.request_id;
      if (body.status == "ERROR") {
        ctx.set.status = 400;
        await prismaClient.model.updateMany({
          where: {
            falAiModelRequestId: requestId,
          },
          data: {
            status: "COMPLETED",
          },
        });
        ctx.set.status = 400;
        return {
          message: "Failed TO generate Model",
          data: body,
        };
      }

      const { imageUrl } = await falAimodel.generateThumbnailForModel(
        body.payload.diffusers_lora_file.url
      );

      await prismaClient.model.updateMany({
        where: {
          falAiModelRequestId: requestId,
        },
        data: {
          tensorPath: body.payload.diffusers_lora_file.url,
          status: "COMPLETED",
          thumbnail: imageUrl,
        },
      });

      ctx.set.status = 200;
      return {
        message: "Webhook processed successfully Model Trained Successfully",
      };
    } catch (error) {
      ctx.set.status = 500;
      return { message: "Failed to process webhook", error: error };
    }
  },

  // Webhook Handler for Image generation it will hit once the image generation is completed and it will return a request id or say image path add this to generated images table's image column
  // first check the ctx and then add the relevant data

  handleImageWebhook: async (ctx: Context) => {
    try {
      console.log(
        "====================Received Image Generation Webhook===================="
      );
      const body = ctx.body;
      const requestId = body.request_id;
      if (body.status == "ERROR") {
        ctx.set.status = 400;

        await prismaClient.generatedImages.updateMany({
          where: {
            falAiImageRequestId: requestId,
          },
          data: {
            status: "COMPLETED",
          },
        });
        return {
          message: "Failed to Generate image FalAi Error",
          data: body,
        };
      }

      ctx.set.status = 200;
      await prismaClient.generatedImages.updateMany({
        where: {
          falAiImageRequestId: requestId,
        },
        data: {
          status: "COMPLETED",
          image: body.payload.images[0].url,
        },
      });

      console.log("Webhook received:", body);
      return { message: "Webhook processed successfully" };
    } catch (error) {
      ctx.set.status = 500;
      return {
        message: "Internal Server Error Failed to process webhook",
        error: error,
      };
    }
  },
};
