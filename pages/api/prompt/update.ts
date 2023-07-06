import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/utils/mongoConnection';
import mongoose from 'mongoose';
import { PromptModel, IPrompt } from '@/models/Prompt';
import multer from 'multer';
import fs from 'fs';

const filePath = process.env.NODE_ENV === 'production' ? '/public/images' : 'public/images';
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, filePath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now().toString() + '-' + file.originalname);
  },
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 4.5 * 1024 * 1024 }, // 50MB file size limit
});

interface UploadedFile {
  fieldName: string;
  originalFilename: string;
  path: string;
  headers: any;
  size: number;
}
const PromptModelTyped = PromptModel as mongoose.Model<IPrompt>;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed');
    return;
  } 
  upload.single('imageFile')(req, res, async (err) => {
    if (!!err) {
      return res.status(400).json({ message: err });
    }
    const promptId = req.body.promptId as string;
    const name = req.body.name as string;
    const description = req.body.description as string;
    const prompt = req.body.prompt as string;
    const image = req.file ? req.file.filename : req.body.image as string;
  
    if (!promptId || !name) {
      res.status(400).send('Bad request: promptId , name are required');
      return;
    }  
    try {
      await connectDB();
      const result = await PromptModelTyped.findByIdAndUpdate(promptId,  {name, description, prompt, image }, {new: true});
      res.status(200).json(result);
    } catch (error) {
      console.error('Error updating prompt:', error);
      res.status(500).send('Internal server error');
    }
    // return res.status(200).json({prompt, image})
  })
}

