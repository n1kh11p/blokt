import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
    try {
        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;
        const userId = data.get('userId') as string || 'anonymous';

        if (!file) {
            return NextResponse.json({ success: false, error: 'No file found' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Ensure uploads directory exists
        const uploadDir = join(process.cwd(), 'public', 'uploads');
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) {
            // ignore
        }

        // Create unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}_${Date.now()}.${fileExt}`;
        const filePath = join(uploadDir, fileName);

        await writeFile(filePath, buffer);

        // Return the public URL path
        return NextResponse.json({ success: true, url: `/uploads/${fileName}` });
    } catch (error: any) {
        console.error('API Upload error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
