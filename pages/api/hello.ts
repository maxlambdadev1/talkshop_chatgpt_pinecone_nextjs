import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import { getSession } from 'next-auth/react';

const filePath = process.env.NODE_ENV === 'production' ? '/tmp' : 'tmp';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const userEmail = session?.user?.email;

    // Delete the PDF, DOCX and TXT files
    const files = fs
      .readdirSync(filePath)
      .filter(
        (file) =>
          file.endsWith('.pdf') ||
          file.endsWith('.docx') ||
          file.endsWith('.txt'),
      );

    res.status(200).json({ message: files });
}
