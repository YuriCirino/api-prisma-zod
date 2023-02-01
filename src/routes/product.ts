import { prisma } from '../lib/prisma'
import { FastifyInstance } from 'fastify';
import { z } from 'zod'

export default async function productRoutes(app: FastifyInstance){

    app.get('/products', async () => {
        let products = await prisma.product.findMany()
        return products
    })
    app.get('/product/:id', async (request, reply) => {
        const getProductParams = z.object({
            id: z.string({ invalid_type_error: "ID precisar ser um texto" })
                .min(10, "ID precisar ter no mínimo 10 caracteres")
        })
        try {
            const { id } = getProductParams.parse(request.params)
            const product = await prisma.product.findUnique({
                where: { id }
            })
            if (product == null) reply.code(409).send({ sucess: false, message: "Este produto não existe" })
            else reply.code(200).send({ sucess: true, product })
        } catch (error) {
            if (error instanceof z.ZodError) {
                return reply.code(409).send({
                    sucess: false,
                    message: error.issues.map(issue => issue.message)
                }
                )
            } else {
                return reply.code(400).send({ sucess: false, error })
            }


        }
    })
    app.post('/product', async (request, reply) => {
        const createProductBody = z.object({
            name: z.string({ required_error: "Nome é obrigatório", }).min(3, "A descrição tem que ter no mínimo 3 caracteres").max(100, "A descrição tem que ter no máximo 100 caracteres"),
            description: z.string({ required_error: "Descrição é obrigatório", }).min(4, "A descrição tem que ter no mínimo 4 caracteres").max(400, "A descrição tem que ter no máximo 400 caracteres"),
            price: z.number({ required_error: "Preço é obrigatório", invalid_type_error: "O Preço tem que ser um números" }),
            order: z.string().optional()
        })
        try {
            const product = createProductBody.parse(request.body)
            const productCreated = await prisma.product.create({ data: product })

            reply.code(201).send({ sucess: true, message: "Produto criado com sucesso", product: productCreated })

        }
        catch (error) {
            if (error instanceof z.ZodError) {
                return reply.code(409).send({
                    sucess: false,
                    message: error.issues.map(issue => issue.message)
                }
                )
            } else {
                return reply.code(400).send({ sucess: false, error })
            }


        }

    })
    app.delete('/product/:id', async (request, reply) => {
        const deleteProductParams = z.object({
            id: z.string({ invalid_type_error: "ID precisar ser um texto" })
                .min(10, "ID precisar ter no mínimo 10 caracteres")
        })
        try {

            const { id } = deleteProductParams.parse(request.params)
            const product = await prisma.product.findUnique({ where: { id: id } })
            if (product == null) return reply.code(209).send({ sucess: false, error: "Este produto não existe" })
            else {
                await prisma.product.delete({ where: { id: id } })
                return reply.code(200).send({ sucess: true, message: "Produto excluído com sucesso" })
            }


        } catch (error) {
            if (error instanceof z.ZodError) {
                return reply.code(409).send({
                    sucess: false,
                    message: error.issues.map(issue => issue.message)
                }
                )
            } else {
                return reply.code(400).send({ sucess: false, error })
            }


        }

    })
    app.put('/product/:id', async (request, reply) => {
        const updateProductBody = z.object({
            name: z.string({ required_error: "Nome é obrigatório", }).min(3, "A descrição tem que ter no mínimo 3 caracteres").max(100, "A descrição tem que ter no máximo 100 caracteres").optional(),
            description: z.string({ required_error: "Descrição é obrigatório", }).min(4, "A descrição tem que ter no mínimo 4 caracteres").max(400, "A descrição tem que ter no máximo 400 caracteres").optional(),
            price: z.number({ required_error: "Preço é obrigatório", invalid_type_error: "O Preço tem que ser um números" }).optional(),
            order: z.string().optional()
        })
        const updateProductParams = z.object({
            id: z.string({ invalid_type_error: "ID precisar ser um texto" })
                .min(10, "ID precisar ter no mínimo 10 caracteres")
        })

        try {

            const { id } = updateProductParams.parse(request.params)
            const product = updateProductBody.parse(request.body)
            const productExists = prisma.product.findUnique({ where: { id: id } })
            if (productExists == null) return reply.code(409).send({ sucess: false, message: "O produto não existe" })
            else {
                const productUpdated = await prisma.product.update({ where: { id: id }, data: product })
                reply.code(200).send({ sucess: true, message: "Produto alterado com sucesso", product: productUpdated })
            }

        } catch (error) {
            if (error instanceof z.ZodError) {
                return reply.code(409).send({
                    sucess: false,
                    message: error.issues.map(issue => issue.message)
                }
                )
            } else {
                return reply.code(400).send({ sucess: false, error })
            }


        }

    })



}