import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// A `main` function so that you can use async/await
async function main() {
  // const allUsers = await getAllUsers()

  // const createdUser = await createUser()

  // const updatedUser = await updateUser()

  // const result = await createPost()

  // const result = await updatePost()

  // const result = await getUserById()
  
  // const result = await getPostWithUser()

  // const result = await createUserAndRelatedPost()

  // const result = await getFilteredUser()

  console.log('result', result)
}

main()
  .catch(e => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

async function getFilteredUser() {
  return await prisma.user.findMany({
    where: {
      name: {
        startsWith: 't'
      }
    }
  })
}

async function createUserAndRelatedPost() {
  return await prisma.user.create({
    data: {
      email: 'test@qwe.rty',
      name: 'qwe',
      posts: {
        create: {
          title: 'user qwe title post',
          content: 'qwerty use pencel a lot'
        }
      }
    }
  })
}

async function getPostWithUser() {
  return await prisma.post.findMany({
    include: {
      author: true
    }
  })
}

async function getUserById() {
  return await prisma.user.findMany({
    where: {
      id: 1
    },
    select: {
      id: true,
      name: true
    }
  })
}

async function updatePost() {
  return await prisma.post.update({
    where: {
      id: 1
    },
    data: {
      author: {
        connect: { id: 3 }
      }
    }
  })
}

async function createPost() {
  return await prisma.post.create({
    data: {
      title: '123'
    }
  })
}

async function getAllUsers() {
  return await prisma.user.findMany()
}

async function createUser() {
  return await prisma.user.create({
    data: {
      email: '123@tr.ru',
      name: 'create with Prisma'
    }
  })
}

async function updateUser() {
  return await prisma.user.update({
    data: {
      name: '123'
    },
    where: {
      id: 4
    }
  })
}

