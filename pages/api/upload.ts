import multer from 'multer';
import fs from 'fs';

const filePath = process.env.NODE_ENV === 'production' ? '/tmp' : 'tmp';
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, filePath);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
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

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: any, res: any) {
  upload.array('files', 20)(req, res, async (err) => {
    if (!!err) {
      return res.status(400).json({ message: err });
    }
    const filePath = process.env.NODE_ENV === 'production' ? '/tmp' : 'tmp';

    // Delete the PDF, DOCX and TXT files
    const files = fs
      .readdirSync(filePath)
      .filter(
        (file) =>
          file.endsWith('.pdf') ||
          file.endsWith('.docx') ||
          file.endsWith('.txt'),
      );

    res.status(200).json({ data : files });
  });
}
