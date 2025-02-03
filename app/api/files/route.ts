import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { minioClient, bucketName } from '@/lib/minio';
import { v4 as uuidv4 } from 'uuid';
import { PutObjectCommand } from "@aws-sdk/client-s3";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const key = uuidv4();
    const filename = file.name;
    const mimetype = file.type;
    const size = file.size;

    // Upload to MinIO using S3 client
    await minioClient.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
      })
    );

    // Save file reference to database
    const fileRecord = await prisma.file.create({
      data: {
        filename,
        mimetype,
        size,
        key,
        bucket: `${bucketName}`,
      },
    });

    return NextResponse.json(fileRecord);
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const files = await prisma.file.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(files);
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Error fetching files' },
      { status: 500 }
    );
  }
}