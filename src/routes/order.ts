import { prisma } from '../lib/prisma'
import { FastifyInstance } from 'fastify';
import { z } from 'zod'

export default async function orderRoutes(app: FastifyInstance) {

    app.get('/orders', async () => {
        let orders = await prisma.order.findMany()
        return orders
    })

    app.get('/order/:id', async (request, reply) => {
        const getOrderParams = z.object({
            id: z.string({ invalid_type_error: "ID precisar ser um texto" })
                .min(10, "ID precisar ter no mínimo 10 caracteres")
        })
        try {
            const { id } = getOrderParams.parse(request.params)
            const order = await prisma.order.findUnique({ where: { id: id } })
            if (order == null) reply.code(409).send({ sucess: false, message: "Esse pedido não existe" })
            else reply.code(200).send({ sucess: true, order })

        } catch (error) {
            if (error instanceof z.ZodError) {
                return reply.code(409).send({ sucess: false, message: error.issues.map(issue => issue.message) })
            } else {
                return reply.code(400).send({ sucess: false, error })
            }

        }

    })

    app.post('/order', async (request, reply) => {
        const productsIdList = ["", "", ""]
        const productsList = [{ id: "", value: 0 }, { id: "", value: 0 }, { id: "", value: 0 }]
        const value = 0 //sum of value of the product list
        //create order to get order id
        await prisma.order.create({
            data: {
                customer_id: "",
                value: 900
            }
        })

        //do this for each product
        await prisma.productsOnOrder.create({
            data: {
                amount_product_to_order: 1,
                order_id: "order_id above",
                product_id: "current product_id"
            }
        })

        await prisma.order.create({
            data: {
                customer_id: "",
                value: 900,
                products: { connect: [{}] }
            }
        })




    })


}