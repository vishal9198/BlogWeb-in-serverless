import { Hono } from "hono";
// import the client from the generated output specified in schema.prisma
// since you set `output = "../src/generated/prisma"` we pull from that location
import { PrismaClient } from "../../generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign, verify } from "hono/jwt";
import { createBlog, updateBlog } from "@vishal_1408/medium-common";
import { safeParse } from "zod";
export const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
  };
  Variables: {
    userId: string;
  };
}>();
type JwtPayload = {
  id: string;
};
blogRouter.use("/*", async (c, next) => {
  const authheader = c.req.header("Authorization") || "";
  const user = (await verify(authheader, "secret", "HS256")) as JwtPayload;
  if (user) {
    c.set("userId", user.id);
    await next();
  } else {
    c.status(411);
    return c.json({
      msg: "you are not logged in",
    });
  }
});

blogRouter.post("/", async (c) => {
  // console.log("DATABASE_URL:", c.env.DATABASE_URL);

  try {
    const prisma = new PrismaClient({
      accelerateUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const body = await c.req.json();

    const { success } = createBlog.safeParse(body);

    if (!success) {
      c.status(411);
      return c.json({
        msg: "body format of create blog is wrong",
      });
    }

    const blog = await prisma.blog.create({
      data: {
        title: body.title,
        content: body.content,
        authorId: parseInt(c.get("userId")),
      },
    });

    return c.json({
      id: blog.id,
    });
  } catch (e) {
    console.error(e);
    return c.text("Error creating blog", 500);
  }
});

blogRouter.put("/", async (c) => {
  try {
    const prisma = new PrismaClient({
      accelerateUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());

    const body = await c.req.json();

    const { success } = updateBlog.safeParse(body);

    if (!success) {
      c.status(411);
      return c.json({
        msg: "body format of updateblog is wrong",
      });
    }

    const blog = await prisma.blog.update({
      where: {
        id: body.id,
      },
      data: {
        title: body.title,
        content: body.content,
      },
    });
    return c.json({
      id: blog.id,
    });
  } catch (e) {
    console.error(e);
    return c.text("Error signing in  user", 411);
  }
});

//Todo: pagination
blogRouter.get("/bulk", async (c) => {
  try {
    const prisma = new PrismaClient({
      accelerateUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());

    const blogs = await prisma.blog.findMany();

    return c.json({
      blogs,
    });
  } catch (e) {
    console.log(e);
    c.status(411);

    return c.text("error in getting bulking  blog");
  }
});

blogRouter.get("/:id", async (c) => {
  try {
    const id = c.req.param("id"); // string
    const blogId = Number(id);
    const prisma = new PrismaClient({
      accelerateUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());

    const blog = await prisma.blog.findFirst({
      where: {
        id: blogId,
      },
    });
    return c.json({
      blog,
    });
  } catch (e) {
    console.log(e);
    c.status(411);

    return c.text("error in getting blog");
  }
});
