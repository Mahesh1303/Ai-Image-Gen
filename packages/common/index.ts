import {z} from "zod"

export const TrainModel = z.object({
    name:z.string(),
    type: z.enum(["man","women","other"]),
    age: z.number(),
    ethnicity: z.enum(["american", "african", "asian"]),
    images:z.array(z.string())
})

export const GenerateImage = z.object({
    prompt:z.string(),
    modeleName:z.string()
})


// export const GeneratedImagesFromPrompt= z,object({
    
// })