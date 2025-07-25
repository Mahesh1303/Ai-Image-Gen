import { prismaClient } from 'db';
// import {prismaClient} from "db"
import type { Context } from "elysia"
import {TrainModel,GenerateImage,GeneratedImagesFromPack} from  "common"

export const AiHandler={
    
    
handleTrainAi :async (ctx:Context)=>{

    try {
        
        const ParsedBody= TrainModel.safeParse(ctx.body)    
        if(!ParsedBody){
            ctx.set.status=400
            return {message:"Invalid Credentials ",
                    }
            
        }
        ctx.set.status=200
        return{
            message:"AI training initiated Successfully"
        }
    } catch (error) {
        
        ctx.set.status=500
        return{
            message:"Failed TO train the model"
        }
    }

    
    },
    
handleGenerateAi: async(ctx:Context) =>{
            try {
                    const parsedBody = GenerateImage.safeParse(ctx.body)
                if(!parsedBody){
                    ctx.set.status=400
                    return {message:"Invalid Credentials"}
                }

                ctx.set.status=200
                return{
                    message:"Images Generating Succesfully"
                }

            } catch (error) {
                
            }


    }
}




