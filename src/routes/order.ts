import { prisma } from '../lib/prisma'
import { FastifyInstance } from 'fastify';
import { z } from 'zod'
import { Decimal } from '@prisma/client/runtime';
type MergedProduct = Array<{ id: string, amount: number, price: Decimal, order_id?: string }>

export default async function orderRoutes(app: FastifyInstance) {

    app.get('/orders', async () => {
        let orders = await prisma.order.findMany()
        return orders
    })
    app.get('/products_order', async () => {
        return await prisma.productsOnOrder.findMany()
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

        const createOrderBody = z.object({
            customer_id: z.string({ invalid_type_error: "ID do cliente precisar ser um texto" })
                .min(10, "ID do cliente precisar ter no mínimo 10 caracteres"),
            products: z.array(z.object({
                id: z.string({ invalid_type_error: "ID do produto precisar ser um texto" })
                    .min(10, "ID do produto precisar ter no mínimo 10 caracteres"),
                amount: z.number({ invalid_type_error: "Quantidade de produtos precisa ser um número." })
                    .positive({ message: "A quantidade do produto precisa ser um número positivo" }).optional().default(1)
            }))
        })

        try {
            const { customer_id, products } = createOrderBody.parse(request.body)

            const productsIdList = products.map(product => product.id)

            const customer = await prisma.customer.findUnique({ where: { id: customer_id } })

            if (customer == null) { //verifying if customer exists
                return reply.code(409).send({ sucess: false, message: "Cliente não existe" })
            }

            const productsListFromDb = await prisma.product.findMany({
                where: {
                    id: {
                        in: [...productsIdList]
                    }

                }, select: {
                    id: true,
                    price: true,
                }

            })


            if (productsListFromDb.length !== productsIdList.length) {//verifying if all products exists
                return reply.code(409).send({ sucess: false, message: "O Id de algum produto é invalido." })
            }

            const mergedProductList: MergedProduct = []

            productsListFromDb.forEach(product => { //merging products information

                products.forEach(pr => {
                    if (pr.id == product.id) {
                        mergedProductList.push(
                            {
                                id: product.id,
                                price: product.price,
                                amount: pr.amount
                            }
                        )
                    }
                })

            })

            let totalPrice = 0
            mergedProductList.forEach(product => {
                totalPrice += product.amount * product.price.toNumber()
            })



            const order = await prisma.$transaction(async (tx) => {

                //create new order to get an order id
                const newOrder = await tx.order.create({
                    data: {
                        value: totalPrice,
                        customer_id: customer.id,
                    }
                })

                //create the relation betwen order_id <=> products_id,amount
                const relationData = mergedProductList.map(product => {


                    return {
                        amount_product_to_order: product.amount,
                        order_id: newOrder.id,
                        product_id: product.id

                    }
                })


                for await (const relation of relationData) {// aplying the relations on the data base
                    await tx.productsOnOrder.create({ data: relation })

                }
                return newOrder
            })

            return reply.code(201).send({ sucess: true, order })

        } catch (error) {
            if (error instanceof z.ZodError) {
                reply.code(409).send({ sucess: false, message: error.issues.map(issue => issue.message) })
            } else {
                reply.code(400).send({ sucess: false, error })
            }

        }


    })

    //Patch route does not make sense, if some information on the order was wrong, delete e and create, with updated values
    app.delete('/order/:id', async (request, reply) => {
        const deleteOrderParams = z.object({
            id: z.string({ invalid_type_error: "ID precisar ser um texto" })
                .min(10, "ID precisar ter no mínimo 10 caracteres")
        })
        const { id:order_id } = deleteOrderParams.parse(request.params) //aliasing id  as order_id
        const order = await prisma.order.findUnique({ where: { id: order_id } })
        if (order==null) return reply.code(409).send({sucess:false, message:"Pedido não encontrado, tente novamente."})

        const response = await prisma.$transaction(async (tx) => {
            await tx.productsOnOrder.deleteMany({where:{
                order_id:order.id
            }})
            await tx.order.delete({where:{
                id:order.id
            }})
            return{sucess:true,message:"Pedido apagado com sucesso."}
        })
        reply.send(response)

    })

}