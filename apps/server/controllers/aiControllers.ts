import { prismaClient } from "db";
// import {prismaClient} from "db"
import type { Context } from "elysia";
import { TrainModel, GenerateImage, GeneratedImagesFromPack } from "common";

const USER = "kjnsdadjsasjdsa"

export const AiHandler = {
  handleTrainAi: async (ctx: Context) => {
    try {
      const ParsedBody = TrainModel.safeParse(ctx.body);
      if (!ParsedBody.success) {
        ctx.set.status = 400;
        return { message: "Invalid Credentials " };
      }
      const { name, type, age, ethnicity, images } = ParsedBody.data;
      const result =await prismaClient.model.create({
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
        modelId:result.id
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
      if (!parsedBody) {
        ctx.set.status = 400;
        return { message: "Invalid Credentials" };
      }

      ctx.set.status = 200;
      return {
        message: "Images Generating Succesfully",
      };
    } catch (error) {}
  },
};
