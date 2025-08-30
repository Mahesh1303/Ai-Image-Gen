import Elysia from "elysia";

export const userRoutes = new Elysia({prefix:"/api"})
.get('/',(ctx)=>{
    return {
        message:"backend Hit"
    }
})