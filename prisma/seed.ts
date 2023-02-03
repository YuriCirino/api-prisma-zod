
import { prisma } from "../src/lib/prisma"
const dataIDs: { customers: Array<string>, products: Array<string> } = { customers: [], products: [] }


async function main() {
    await prisma.$transaction(async (tx) => {

        console.log('--Clearing all data')
        //Deleting all data
        await prisma.productsOnOrder.deleteMany({})
        await prisma.order.deleteMany({})
        await prisma.customer.deleteMany({})
        await prisma.product.deleteMany({})

        //Creating customers
        console.log('----Creating customers')
        const customer_1 = await prisma.customer.create({
            data: {
                name: "John Due",
                cpf: "12332112332",
            }
        })
        const customer_2 = await prisma.customer.create({
            data: {
                name: "Cage Fon",
                cpf: "12442112442"
            }
        })
        const customer_3 = await prisma.customer.create({
            data: {
                name: "Due Fon",
                cpf: "92342992442"
            }
        })

        //Creating products
        console.log('------Creating products')

        const product_1 = await prisma.product.create({
            data: {
                name: "Teclado RGB",
                description: "Teclado mecânico com RGB",
                price: 350
            }
        })
        const product_2 = await prisma.product.create({
            data: {
                name: "Mouse RGB",
                description: "Mouse de alto desempenho com RGB",
                price: 300
            }
        })
        const product_3 = await prisma.product.create({
            data: {
                name: "Monitor Gamer",
                description: "Monitor de baixa latência (1ms) e alta taxa de atualização (144hz)",
                price: 350
            }
        })
        const product_4 = await prisma.product.create({
            data: {
                name: "Mesa para computador",
                description: "Mesa grande e com altura regulável para comportar todo seu equipamento",
                price: 350
            }
        })

        //Creating relations
        const relationsToOrder_1 = [
            {
                product: product_1,
                amount: 1
            },
            {
                product: product_2,
                amount: 2
            },
        ]
        let price = 0

        relationsToOrder_1.forEach(relation => {
            price += relation.product.price.toNumber() * relation.amount
        })
        console.log('--------Creating order')
        const order_1 = await prisma.order.create({
            data: {
                customer_id: customer_1.id,
                value: price,

            }
        })
        //Creating relations on table
        console.log('----------Creating relations')
        for await (const relation of relationsToOrder_1) {

            await prisma.productsOnOrder.create({
                data: {
                    amount_product_to_order: relation.amount,
                    order_id: order_1.id,
                    product_id: relation.product.id

                }
            })
        }


    })



}



main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })