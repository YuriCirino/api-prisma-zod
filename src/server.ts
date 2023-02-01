import Fastify from "fastify"
import cors from '@fastify/cors'

import customerRoutes from "./routes/customer"
import productRoutes from "./routes/product"
import orderRoutes from "./routes/order"

const app = Fastify({
})

app.register(cors)
app.register(customerRoutes)
app.register(productRoutes)
app.register(orderRoutes)

app.get('/', async () => 'Welcome')

app.listen({port:3333,host:'0.0.0.0'},(err,address)=>{
    if(err){
        console.log(err)
    }else{
        console.log('App runing at',address)
    }
})