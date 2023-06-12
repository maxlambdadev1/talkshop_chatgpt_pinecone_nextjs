import multiparty from 'multiparty';
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs-extra';
import multer from 'multer';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'tmp');
  },
  filename: function (req, file, cb) {
    cb(null, (file.originalname));
  },
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB file size limit
});

interface UploadedFile {
  fieldName: string;
  originalFilename: string;
  path: string;
  headers: any;
  size: number;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  // req: NextApiRequest,
  // res: NextApiResponse,
  req: any,
  res: any,
) {
  upload.array('files', 20)(req, res, async (err) => {
    if (!!err) {
      return res.status(400).json({ message: err });
    }
    const files = req.files;



    // if (!files) {
    //   return res.status(400).json({ error: 'No file uploaded' });
    // }
    // const uploadedFiles: string[] = [];
    // for (let i = 0; i < files.length ; i++ ) {
    //   const uploadedFile = files[i] as any;

    //     const projectTmpDir = path.join(process.cwd(), 'tmp');
    //     fs.mkdirSync(projectTmpDir, { recursive: true });

    //     const newFilePath = path.join(
    //       projectTmpDir,
    //       uploadedFile?.originalFilename,
    //     );
    //     // fs.renameSync(uploadedFile.path, newFilePath);
    //     await fs.move(uploadedFile.path, newFilePath, (err: any) => {
    //       if (err) {
    //         console.error(err);
    //       } else {
    //         console.log('File moved successfully!');
    //       }
    //     });

    //     uploadedFiles.push(newFilePath);
    // }

    // if (uploadedFiles.length > 0) {
    //   return res.status(200).json({
    //     message: `Files ${uploadedFiles.join(', ')} uploaded and moved!`,
    //   });
    // } else {
    //   return res.status(400).json({ message: 'No files uploaded' });
    // }

    
      return res.status(200).json({ message : files });
  });

}
