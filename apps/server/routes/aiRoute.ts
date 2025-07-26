import { AiHandler } from "controllers/aiControllers";
import Elysia from "elysia";

export const aiRoutes = new Elysia({ prefix: "/api/v1" })
.get("/ai/getImages",AiHandler.handleGetImage)   
.post('/webhook', AiHandler.handleWebhook)
.post("/ai/train", AiHandler.handleTrainAi)
.post("/ai/generate", AiHandler.handleGenerateAi);
