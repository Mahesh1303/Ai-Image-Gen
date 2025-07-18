import {Elysia} from "elysia"
import { aiRoutes } from "routes/aiRoute"
let app = new Elysia()

.use(aiRoutes)
.listen(4000, ()=>{
    console.log("Server Started at port 4000")
})