import { AiHandler } from "controllers/aiControllers";
import Elysia from "elysia";

export const aiRoutes = new Elysia({ prefix: "/api/v1" })
.get("/ai/getImages",AiHandler.handleGetImage)   
.post('/ai/image/webhook', AiHandler.handleImageWebhook)
.post("/ai/train", AiHandler.handleTrainAi)
.post("/ai/generate", AiHandler.handleGenerateAi)
.post("/ai/model/webhook",AiHandler.handleModelWebhook)
