import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs';

// Disable Next.js default body parser to handle the raw stream via formidable
export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');

        // Ensure upload directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const form = formidable({
            uploadDir,
            keepExtensions: true,
            maxFileSize: 10 * 1024 * 1024 * 1024, // 10 GB limit for absolute safety
            filename: (name, ext, part, form) => {
                // use original filename provided by client or generate unique one
                const userId = req.headers['x-user-id'] || 'anonymous';
                const fileExt = part.originalFilename?.split('.').pop() || 'mp4';
                return `${userId}_${Date.now()}.${fileExt}`;
            },
        });

        form.parse(req, (err, fields, files) => {
            if (err) {
                console.error('Formidable Error:', err);
                return res.status(500).json({ success: false, error: 'Failed to parse form data' });
            }

            const file = files.file;
            if (!file) {
                return res.status(400).json({ success: false, error: 'No file uploaded' });
            }

            // `file` can be an array if multiple files are uploaded with same name
            const uploadedFile = Array.isArray(file) ? file[0] : file;
            const fileName = path.basename(uploadedFile.filepath);

            return res.status(200).json({
                success: true,
                url: `/uploads/${fileName}`
            });
        });
    } catch (error: any) {
        console.error('API Upload error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
