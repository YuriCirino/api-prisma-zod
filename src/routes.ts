import { prisma } from './lib/prisma';
import { FastifyInstance } from 'fastify';
import { z } from 'zod'
export default async function appRoutes(app: FastifyInstance) {

    app.get('/', async () => 'Welcome')

    app.get('/orders', async () => {
        let orders = await prisma.order.findMany()
        return orders
    })


    // Customer Routes
    app.get('/customers', async () => {
        let customers = await prisma.customer.findMany()
        return customers
    })
    app.get('/customer/:id', async (request, reply) => {
        const getCustomerParams = z.object({
            id: z.string({ invalid_type_error: "ID precisar ser um texto" })
                .min(10, "ID precisar ter no mínimo 10 caracteres")
        })

        try {
            const { id } = getCustomerParams.parse(request.params)
            const customer = await prisma.customer.findUnique({
                where: { id }
            })
            if (customer == null) reply.code(409).send({ sucess: false, message: "O cliente não existe" })
            else reply.code(200).send({ sucess: true, customer })

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
    app.post('/customer', async (request, reply) => {
        const createCustomerBody = z.object({
            name: z.string({ required_error: "Nome do cliente é obrigatório", }).min(5, "O nome tem que ter no mínimo 5 caracteres").max(100, "A descrição tem que ter no máximo 100 caracteres"),
            cpf: z.string({ required_error: "CPF é obrigatório", }).length(11, "CPF tem que ter 11 númeross"),

        })
        try {
            const customer = createCustomerBody.parse(request.body)
            let customerAlreadyExists = await prisma.customer.findUnique(
                {
                    where: { cpf: customer.cpf }
                }
            )
            if (customerAlreadyExists !== null) return reply.code(409).send({ sucess: false, message: "Este cpf já está cadastrado" })
            else {

                const customerCreated = await prisma.customer.create({ data: customer })
                reply.code(201).send({ sucess: true, message: "Cliente criado com sucesso", customer: customerCreated })
            }


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
    app.delete('/customer/:id', async (request, reply) => {
        const deleteCustomerParams = z.object({
            id: z.string({ invalid_type_error: "ID precisar ser um texto" })
                .min(10, "ID precisar ter no mínimo 10 caracteres")
        })
        try {
            const { id } = deleteCustomerParams.parse(request.params)
            const customer = await prisma.customer.findUnique({
                where: { id }
            })
            console.log(customer)
            if (customer == null) return reply.code(409).send({ sucess: false, message: "Esse cliente não existe" })
            else {
                await prisma.customer.delete({ where: { id: id } })
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
    app.put('/customer/:id', async (request, reply) => {
        const updateCustomerBody = z.object({
            name: z.string({ required_error: "Nome é obrigatório", }).min(3, "A descrição tem que ter no mínimo 3 caracteres").max(100, "A descrição tem que ter no máximo 100 caracteres").optional(),
            cpf: z.string({ required_error: "CPF é obrigatório", }).length(11, "CPF tem que ter 11 númeross").optional(),

        })
        const updateCustomerParams = z.object({
            id: z.string({ invalid_type_error: "ID precisar ser um texto" })
                .min(10, "ID precisar ter no mínimo 10 caracteres")
        })

        try {

            const { id } = updateCustomerParams.parse(request.params)
            const customer = updateCustomerBody.parse(request.body)
            const customerExists = prisma.customer.findUnique({ where: { id: id } })
            if(customer.cpf!==undefined) {
                const cpfAlreadyExists = prisma.customer.findUnique({where:{cpf:customer.cpf}})
                if(cpfAlreadyExists!==null) return reply.code(409).send({sucess:false,message:"Este cpf já está cadastrado"})
            }
           
            if (customerExists == null) return reply.code(409).send({ sucess: false, message: "O cliente não existe" })
            else {
                const customerUpdated = await prisma.customer.update({ where: { id: id }, data: customer })
                reply.code(200).send({ sucess: true, message: "Cliente alterado com sucesso", customer: customerUpdated })
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

    // Products Routes
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
            if (productExists !== null) return reply.code(409).send({ sucess: false, message: "O produto não existe" })
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