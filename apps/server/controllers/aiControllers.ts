import {prismaClient} from "db"
import type { Context } from "elysia"

export const handleTrainAi = async (ctx:Context)=>{
const {name, email} = ctx.body as {name:string; email:string}

ctx.set.status=200
}

export const handleGenerateAi= async({}) =>{
    
}