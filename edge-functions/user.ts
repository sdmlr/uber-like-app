import { createEdgeRouter } from 'expo-router/server';
import { neon } from '@neondatabase/serverless';

const router = createEdgeRouter();

router.post(async (req, res) => {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const body = await req.json();
    const { name, email, clerkId } = body;

    if (!name || !email || !clerkId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const response = await sql`
      INSERT INTO users (
        name,
        email,
        clerk_id
      )
      VALUES (
        ${name},
        ${email},
        ${clerkId}
      )
    `;

    return res.status(201).json({ data: response });
  } catch (error) {
    console.error("Error in user edge function:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export const handler = router.handler();
