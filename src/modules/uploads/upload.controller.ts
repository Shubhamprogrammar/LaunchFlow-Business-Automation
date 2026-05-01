import { Request, Response } from "express";
import {
  PutObjectCommand
} from "@aws-sdk/client-s3";
import { s3 } from "../../config/s3";
import { prisma } from "../../config/prisma";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../../config/env";

export const getUploadUrl = async (
  req: Request,
  res: Response
) => {
  const { fileName, mimeType } = req.body;

  const key = `uploads/${Date.now()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: env.AWS_BUCKET_NAME!,
    Key: key,
    ContentType: mimeType,
  });

  const uploadUrl = await getSignedUrl(
    s3,
    command,
    { expiresIn: 300 }
  );

  return res.json({
    success: true,
    data: {
      uploadUrl,
      fileUrl: `https://${env.AWS_BUCKET_NAME}.s3.amazonaws.com/${key}`,
      key,
    },
  });
};

// Save metadata after upload
export const saveUploadedFile = async (
  req: Request,
  res: Response
) => {
  const {workspaceId, fileName, fileUrl, size, mimeType } = req.body;

  const file = await prisma.fileUpload.create({
    data: {
      fileName,
      fileUrl,
      size,
      mimeType,
      userId: req.user.id,
      workspaceId,
    },
  });

  return res.json({
    success: true,
    data: file,
  });
};