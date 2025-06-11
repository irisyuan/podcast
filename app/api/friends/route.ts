import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/utils/supabase/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { query } = req.query;
    const supabase = await createClient();

    const { data: users, error } = await supabase
      .from('Users')
      .select('id, first_name, last_name')
      .ilike('first_name', `%${query}%`);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(users);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 