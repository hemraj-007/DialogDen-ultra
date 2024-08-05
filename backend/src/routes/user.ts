import { Hono } from 'hono'
import { User } from '@prisma/client'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode,verify,sign } from 'hono/jwt'
import { signinInput, SigninInput,signupInput } from 'hemraj_bhatia_npmpack'

export const userRouter=new Hono<{
    Bindings:{
      DATABASE_URL:string;
      JWT_SECRET:string;
    }
  }>();

userRouter.post('/signup',async(c)=>{
    const body= await c.req.json();
    const {success}=signupInput.safeParse(body);
    if(!success){
      c.status(411);
      return c.json({
        msg:'inputs are incorrect'
      })
    }
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())
  
  try {
    const user=await prisma.user.create({
      data:{
        email:body.email,
        password:body.password,
        name:body.name
      }
    })
    const jwt=await sign({
      id:user.id
    },c.env.JWT_SECRET);
    return c.text(jwt)
  } catch (error) {
    console.log(error);
    c.status(411);
    return c.text('invalid');
  }
  })
  
userRouter.post('/signin', async(c) => {
      const body= await c.req.json();
      const {success}=signinInput.safeParse(body);
      if(!success){
        c.status(411);
        return c.json({
          msg:'inputs are incorrect'
        })
      }
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())
  
  try {
    const user=await prisma.user.findFirst({
      where:{
        email:body.email,
        password:body.password,
      }
    })
    if(!user){
      c.status(403);
      return c.text('invalid');
    }
    const jwt=await sign({
      id:user.id
    },c.env.JWT_SECRET);
    return c.text(jwt)
  } catch (error) {
    console.log(error);
    c.status(411);
    return c.text('invalid');
  }
    return c.text('signed up!')
  })
  
userRouter.get('/', (c) => {
    return c.text('Hello Hono!')
  })
  