import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function test() {
  try {
    console.log('Testing connection...')
    await prisma.$connect()
    console.log('Connected successfully!')
    
    const users = await prisma.user.findMany({ take: 1 })
    console.log('Users found:', users.length)
    
    await prisma.$disconnect()
    process.exit(0)
  } catch (error) {
    console.error('Connection failed:', error.message)
    await prisma.$disconnect()
    process.exit(1)
  }
}

test()
