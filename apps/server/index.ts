import {Elysia} from "elysia"
import { aiRoutes } from "routes/aiRoute"
import { userRoutes } from "routes/userRoutes"

let app = new Elysia()

.use(aiRoutes)
.use(userRoutes)
.listen(4000, ()=>{
    console.log("Server Started at port 4000")
})