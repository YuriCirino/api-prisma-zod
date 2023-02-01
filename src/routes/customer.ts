import { prisma } from '../lib/prisma'
import { FastifyInstance } from 'fastify';
import { z } from 'zod'

export default async function customerRoutes(app: FastifyInstance){
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
            if (customer.cpf !== undefined) {
                const cpfAlreadyExists = prisma.customer.findUnique({ where: { cpf: customer.cpf } })
                if (cpfAlreadyExists !== null) return reply.code(409).send({ sucess: false, message: "Este cpf já está cadastrado" })
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



}