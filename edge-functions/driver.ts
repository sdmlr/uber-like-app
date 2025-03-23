import { createEdgeRouter } from "expo-router/server";
import { neon } from "@neondatabase/serverless";

const router = createEdgeRouter();

router.get(async (req, res) => {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const response = await sql`SELECT * FROM drivers`;
    return res.json({ data: response });
  } catch (error) {
    console.error("Error fetching drivers:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router.handler();
