import { AiHandler } from "controllers/aiControllers";
import Elysia from "elysia";

export const aiRoutes= new Elysia({prefix:'/api/v1'})
    .post('/ai/train',AiHandler.handleTrainAi)
    .post('/ai/generate',AiHandler.handleGenerateAi)