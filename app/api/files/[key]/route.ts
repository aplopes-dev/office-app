import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { minioClient } from '@/lib/minio';
import { GetObjectCommand } from "@aws-sdk/client-s3";

export async function GET(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const file = await prisma.file.findUnique({
      where: { key: params.key },
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const command = new GetObjectCommand({
      Bucket: file.bucket,
      Key: file.key,
    });

    const response = await minioClient.send(command);
    const chunks: Buffer[] = [];

    // @ts-ignore - Body exists but TypeScript doesn't recognize it
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks as any);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': file.mimetype,
        'Content-Disposition': `inline; filename="${file.filename}"`,
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json(
      { error: 'Error serving file' },
      { status: 500 }
    );
  }
}