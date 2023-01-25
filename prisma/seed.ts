
import { prisma } from "../src/lib/prisma"
const dataIDs: { customers: Array<string>, products: Array<string> } = { customers: [], products: [] }
async function main() {

    console.log('------------Creating customers------------')
    let count = await prisma.customer.count({
        where: {
            name: "John Due"
        }
    })

    if (count == 0) {
        let user_1 = await prisma.customer.create({
            data: {
                name: "John Due",
                cpf: "12332112332",


            }
        })
        console.log(user_1.name)
        dataIDs.customers.push(user_1.id)
    }

    count = await prisma.customer.count({
        where: {
            name: "Cage Fon"
        }
    })
    if (count == 0) {
        const user_2 = await prisma.customer.create({
            data: {
                name: "Cage Fon",
                cpf: "12442112442"
            }
        })
        console.log(user_2.name)
        dataIDs.customers.push(user_2.id)
    }

    count = await prisma.customer.count({
        where: {
            name: "Due Fon"
        }
    })
    if (count == 0) {
        const user_3 = await prisma.customer.create({
            data: {
                name: "Due Fon",
                cpf: "92342992442"
            }
        })
        console.log(user_3.name)
        dataIDs.customers.push(user_3.id)
    }

    console.log('------------Creating products------------')


    let product = await prisma.product.create({
        data:
            { name: "Máquina Gamer", description: "Máquina gamer repleta de RGB", price: 3000 }

    })
    console.log(product.name)
    dataIDs.products.push(product.id)

    product = await prisma.product.create({
        data:
            { name: "Mouse RGB", description: "Mouse gamer repleto de RGB, aumentando bastante o FPS", price: 3000 }

    })
    console.log(product.name)
    dataIDs.products.push(product.id)
    product = await prisma.product.create({
        data:
            { name: "Teclado RGB", description: "Teclado gamer repleto de RGB, garantindo maior reflexo do usuário e jogadas mais épicas", price: 3000 }

    })
    console.log(product.name)
    dataIDs.products.push(product.id)

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