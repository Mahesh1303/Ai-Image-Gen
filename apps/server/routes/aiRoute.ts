import { handleGenerateAi, handleTrainAi } from "controllers/aiControllers";
import Elysia from "elysia";

export const aiRoutes= new Elysia({prefix:'/api/v1'})
    .post('/ai/train',handleTrainAi)
    .post('/ai/train',handleGenerateAi)