import z from "zod";

export const signupInput = z.object({
  username: z.string().email(),
  password: z.string().min(6).max(10),
  name: z.string().optional(),
});

export const signinInput = z.object({
  username: z.string().email(),
  password: z.string().min(6).max(10),
});

export const createBlog = z.object({
  title: z.string(),
  content: z.string(),
});

export const updateBlog = z.object({
  title: z.string(),
  content: z.string(),
  id: z.number(),
});

export type CreateBlog = z.infer<typeof createBlog>;
export type SignupInput = z.infer<typeof signupInput>;
export type SigninInput = z.infer<typeof signinInput>;
export type UpdateBlog = z.infer<typeof updateBlog>;

//z.infer convert this like
// type SignupInput={
//     username:string,
//     password:string,
//     name:string?
// } and this directly used for ts type checking
