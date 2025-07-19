import {prismaClient} from "db"
import type { Context } from "elysia"



export const AiHandler={
    
    
handleTrainAi :async (ctx:Context)=>{
    const {name, email} = ctx.body as {name:string; email:string}
    
    ctx.set.status=200
    },
    
handleGenerateAi: async(ctx:Context) =>{
        
    }
}

