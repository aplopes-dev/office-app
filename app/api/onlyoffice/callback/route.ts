import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { minioClient } from '@/lib/minio';
import { PutObjectCommand } from "@aws-sdk/client-s3";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, status, url } = body;

    console.log("Recebido callback do OnlyOffice:", body);

    if (status === 2 && url) {
      console.log(`Baixando arquivo editado: ${url}`);

      // Find the existing file record
      const fileRecord = await prisma.file.findUnique({
        where: { key },
      });

      if (!fileRecord) {
        return NextResponse.json(
          { error: 'File record not found' },
          { status: 404 }
        );
      }

      try {
        // Download the edited file from OnlyOffice
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to download file: ${response.statusText}`);
        }
        
        const fileBuffer = Buffer.from(await response.arrayBuffer());

        // Upload the updated file to MinIO
        await minioClient.send(
          new PutObjectCommand({
            Bucket: fileRecord.bucket,
            Key: fileRecord.key,
            Body: fileBuffer,
            ContentType: fileRecord.mimetype,
          })
        );

        // Update the file record with new size and modification time
        await prisma.file.update({
          where: { key },
          data: {
            size: fileBuffer.length,
            updatedAt: new Date(),
          },
        });

        console.log(`Arquivo atualizado com sucesso: ${key}`);
      } catch (error) {
        console.error("Erro ao processar o arquivo editado:", error);
        return NextResponse.json(
          { error: 'Failed to process edited file' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ message: "Callback processado com sucesso" });
  } catch (error) {
    console.error("Erro no processamento do callback:", error);
    return NextResponse.json(
      { error: 'Error processing callback' },
      { status: 500 }
    );
  }
}