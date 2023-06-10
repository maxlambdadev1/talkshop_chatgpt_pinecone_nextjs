import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../utils/mongoConnection';
import User from '@/models/User';
import { getSession } from 'next-auth/react';

async function handler(req: NextApiRequest, res: NextApiResponse) {

    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const userEmail = session?.user?.email;
    const userName = session?.user?.name;
    const userImage = session?.user?.image;

  try {
    await connectDB();
    const user = await User.findOne({ email : userEmail});

    if (!!user) {
        res.status(200).json(user);
    } else {
        const user1 = new User({
            email : userEmail,
            name : userName,
            image : userImage,
            role : 'user'
        });
        const response = await user1.save();
        return res.status(200).json(response);
    }

  } catch (error) {
    console.error('Error getting userInfo:', error);
    res.status(500).send('Internal server error');
  }
}

export default handler;
