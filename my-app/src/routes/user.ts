import { Hono } from "hono";
// import the client from the generated output specified in schema.prisma
// since you set `output = "../src/generated/prisma"` we pull from that location
import { PrismaClient } from "../../generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign, verify } from "hono/jwt";
import { signinInput, signupInput } from "@vishal_1408/medium-common";
export const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
  };
}>();

userRouter.post("/signup", async (c) => {
  // console.log("DATABASE_URL:", c.env.DATABASE_URL);

  try {
    const prisma = new PrismaClient({
      accelerateUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const body = await c.req.json();
    const { success } = signupInput.safeParse(body);
    if (!success) {
      c.status(411);
      return c.json({
        msg: "body is not in correct format",
      });
    }
    const user = await prisma.user.create({
      data: {
        username: body.username,
        password: body.password,
      },
    });

    const token = await sign({ id: user.id }, "secret");

    return c.json({ jwt: token });
  } catch (e) {
    console.error(e);
    return c.text("Error creating user", 500);
  }
});

userRouter.post("/signin", async (c) => {
  try {
    const prisma = new PrismaClient({
      accelerateUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());

    const body = await c.req.json();

    const { success } = signinInput.safeParse(body);
    if (!success) {
      c.status(411);
      return c.json({
        msg: "body is not in correct format",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        username: body.username,
        password: body.password,
      },
    });

    if (!user) {
      c.status(401);
      return c.json({ message: "Invalid email or password" });
    }

    const jwt = await sign({ id: user.id }, "secret");

    return c.json({ jwt: jwt });
  } catch (e) {
    console.error(e);
    return c.text("Error signing in  user", 411);
  }
});
