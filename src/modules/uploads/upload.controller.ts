import { Request, Response } from "express";
import {
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { s3 } from "../../config/s3";
import { prisma } from "../../config/prisma";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const getUploadUrl = async (
  req: Request,
  res: Response
) => {
  const { fileName, mimeType } = req.body;

  const key = `uploads/${Date.now()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET!,
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
      fileUrl: `https://${process.env.AWS_BUCKET}.s3.amazonaws.com/${key}`,
      key,
    },
  });
};



// Save metadata after upload

export const saveUploadedFile = async (
  req: Request,
  res: Response
) => {
  const { fileName, fileUrl, size, mimeType } = req.body;

  const file = await prisma.fileUpload.create({
    data: {
      fileName,
      fileUrl,
      size,
      mimeType,
      userId: req.user.id,
      workspaceId: req.body.workspaceId,
    },
  });

  return res.json({
    success: true,
    data: file,
  });
};
