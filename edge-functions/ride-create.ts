import { createEdgeRouter } from 'expo-router/server';
import { neon } from '@neondatabase/serverless';

const router = createEdgeRouter();

router.post(async (req, res) => {
  try {
    const body = await req.json();
    const {
      origin_address,
      destination_address,
      origin_latitude,
      origin_longitude,
      destination_latitude,
      destination_longitude,
      ride_time,
      fare_price,
      payment_status,
      driver_id,
      user_id,
    } = body;

    if (
      !origin_address ||
      !destination_address ||
      !origin_latitude ||
      !origin_longitude ||
      !destination_latitude ||
      !destination_longitude ||
      !ride_time ||
      !fare_price ||
      !payment_status ||
      !driver_id ||
      !user_id
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const sql = neon(`${process.env.DATABASE_URL}`);

    const response = await sql`
      INSERT INTO rides ( 
        origin_address, 
        destination_address, 
        origin_latitude, 
        origin_longitude, 
        destination_latitude, 
        destination_longitude, 
        ride_time, 
        fare_price, 
        payment_status, 
        driver_id, 
        user_id
      ) VALUES (
        ${origin_address},
        ${destination_address},
        ${origin_latitude},
        ${origin_longitude},
        ${destination_latitude},
        ${destination_longitude},
        ${ride_time},
        ${fare_price},
        ${payment_status},
        ${driver_id},
        ${user_id}
      )
      RETURNING *;
    `;

    return res.status(201).json({ data: response[0] });
  } catch (error) {
    console.error("Error inserting data into rides:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export const handler = router.handler();
