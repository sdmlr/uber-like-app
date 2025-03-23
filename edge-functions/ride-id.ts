import { createEdgeRouter } from 'expo-router/server';
import { neon } from '@neondatabase/serverless';

const router = createEdgeRouter();

router.get(async (req, res) => {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const response = await sql`
      SELECT
        rides.ride_id,
        rides.origin_address,
        rides.destination_address,
        rides.origin_latitude,
        rides.origin_longitude,
        rides.destination_latitude,
        rides.destination_longitude,
        rides.ride_time,
        rides.fare_price,
        rides.payment_status,
        rides.created_at,
        'driver', json_build_object(
            'driver_id', drivers.id,
            'first_name', drivers.first_name,
            'last_name', drivers.last_name,
            'profile_image_url', drivers.profile_image_url,
            'car_image_url', drivers.car_image_url,
            'car_seats', drivers.car_seats,
            'rating', drivers.rating
        ) AS driver 
      FROM 
        rides
      INNER JOIN
        drivers ON rides.driver_id = drivers.id
      WHERE 
        rides.user_id = ${id}
      ORDER BY 
        rides.created_at DESC;
    `;

    return res.status(200).json({ data: response });
  } catch (error) {
    console.error("Error fetching recent rides:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export const handler = router.handler();
