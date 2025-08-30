import { z } from "zod"

export const TrainModel = z.object({
  userId: z.string()
    .min(1, "User ID is required")
    .uuid("User ID must be a valid UUID"),

  name: z.string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  
  type: z.enum(["man", "women", "other"], {
    message: "Type must be 'man', 'women', or 'other'" 
  }),
  
  age: z.number()
    .int("Age must be a whole number")
    .min(1, "Age must be at least 1")
    .max(120, "Age must be less than 120"),
  
  ethnicity: z.enum(["american", "african", "asian"], {
    message: "Ethnicity must be 'american', 'african', or 'asian'" 
  }),
  
  zipUrl:z.string().url("Must be a valid URL")

  
})

export const GenerateImage = z.object({
  prompt: z.string()
    .min(1, "Prompt is required")
    .max(500, "Prompt must be less than 500 characters"),
  
  modelId: z.string()
    .min(1, "Model ID is required")
    .uuid("Model ID must be a valid UUID"),
  
  num: z.number()
    .int("Number must be a whole number")
    .min(1, "Must generate at least 1 image")
    .max(10, "Maximum 10 images can be generated at once")
})

export const GeneratedImagesFromPack = z.object({
  packId: z.string()
    .min(1, "Pack ID is required")
    .uuid("Pack ID must be a valid UUID"),
  
  modelId: z.string()
    .min(1, "Model ID is required")
    .uuid("Model ID must be a valid UUID")
})

// Here's the schema you were trying to create
export const GeneratedImagesFromPrompt = z.object({
  prompt: z.string()
    .min(1, "Prompt is required")
    .max(500, "Prompt must be less than 500 characters"),
  
  userId: z.string()
    .min(1, "User ID is required")
    .uuid("User ID must be a valid UUID"),
  
  limit: z.number()
    .int("Limit must be a whole number")
    .min(1, "Minimum 1 image")
    .max(50, "Maximum 50 images")
    .optional()
    .default(10), // Default to 10 if not provided
  
  createdAfter: z.string()
    .datetime("Must be a valid ISO datetime")
    .optional()
})

// Type exports for TypeScript
export type TrainModelType = z.infer<typeof TrainModel>
export type GenerateImageType = z.infer<typeof GenerateImage>
export type GeneratedImagesFromPackType = z.infer<typeof GeneratedImagesFromPack>
export type GeneratedImagesFromPromptType = z.infer<typeof GeneratedImagesFromPrompt>