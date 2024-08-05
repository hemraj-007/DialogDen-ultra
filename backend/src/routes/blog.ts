import { Hono } from 'hono'
import { User } from '@prisma/client'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode,verify,sign } from 'hono/jwt'
import { createBlogInput, CreateBlogInput,updateBlogInput } from 'hemraj_bhatia_npmpack'

export const blogRouter = new Hono<{
  Bindings: {
      DATABASE_URL: string;
      JWT_SECRET: string;
  }, 
  Variables: {
      userId: string;
  }
}>();

blogRouter.use("/*", async (c, next) => {
  const authHeader = c.req.header("authorization") || "";
  try {
      const user = await verify(authHeader, c.env.JWT_SECRET);
      if (user) {
          c.set("userId", user.id as string);
          await next();
      } else {
          c.status(403);
          return c.json({
              message: "You are not logged in"
          })
      }
  } catch(e) {
      c.status(403);
      return c.json({
          message: "You are not logged in"
      })
  }
});

blogRouter.use("/*", async (c, next) => {
  console.log(`Request to: ${c.req.path}`);
  await next();
});


blogRouter.get('/:id', async(c) => {
    const id=c.req.param("id");
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const blog=prisma.post.findFirst({
        where:{
            id:id
        }
    })
    return c.json({
        blog
    })
  } catch (error) {
     c.status(411)
     return c.json({
        msg:'error while fetching blogs'
     })
  }
})

blogRouter.post('/abc', async(c) => {
    const body= await c.req.json();
    const {success}=createBlogInput.safeParse(body);
    if (!success) {
      c.status(411);
      return c.json({
          message: "Inputs not correct"
      })
  }
    const authId=c.get("userId");
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const blog=await prisma.post.create({
    data:{
        title:body.title,
        content:body.content,
        authorId: authId
    }
  })
	return c.json({
        id:blog.id
    })
})

blogRouter.put('/', async(c) => {
    const body= await c.req.json();
    const { success } = updateBlogInput.safeParse(body);
    if (!success) {
        c.status(411);
        return c.json({
            message: "Inputs not correct"
        })
    }
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const blog=await prisma.post.update({
    where:{
        id:body.id
    },
    data:{
        title:body.title,
        content:body.content,
    }
  })
	return c.json({
        id:blog.id
    })
	return c.text('signin route')
})

blogRouter.get('/bulk',async(c)=>{
    const body= await c.req.json();
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const blogs=await prisma.post.findMany();

  return c.json({
    blogs
  })
})



//  https://backend.hemrajbhatia38.workers.dev
//  https://backend.hemrajbhatia38.workers.dev