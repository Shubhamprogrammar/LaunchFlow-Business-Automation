import { Request, Response, NextFunction } from "express";
import {
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { s3 } from "../../config/s3";
import { prisma } from "../../config/prisma";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../../config/env";
import { eventBus } from "../events/event.bus";
import { EventTypes } from "../events/event.types";
import { presignSchema, completeUploadSchema } from "./upload.validation";

export const getUploadUrl = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileName, mimeType } = presignSchema.parse(req.body);

    // Sanitize fileName to prevent path traversal
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `uploads/${Date.now()}-${safeName}`;

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
  } catch (error) {
    next(error);
  }
};

// Save metadata after upload
export const saveUploadedFile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { workspaceId, fileName, fileUrl, size, mimeType } =
      completeUploadSchema.parse(req.body);

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

    eventBus.emit(EventTypes.FILE_UPLOADED, {
      workspaceId,
      userId: req.user.id,
      fileId: file.id,
      fileName,
      size,
    });

    return res.json({
      success: true,
      data: file,
    });
  } catch (error) {
    next(error);
  }
};

export const listWorkspaceFiles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { workspaceId } = req.params;

     if (!workspaceId || Array.isArray(workspaceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid workspaceId",
      });
    }

    const files = await prisma.fileUpload.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      success: true,
      data: files,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFileController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileId } = req.params;

    if (!fileId || Array.isArray(fileId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid fileId",
      });
    }

    const file = await prisma.fileUpload.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // Ownership check: verify user belongs to the workspace
    const membership = await prisma.membership.findFirst({
      where: {
        workspaceId: file.workspaceId,
        userId: req.user.id,
      },
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete this file",
      });
    }

    // 1. Delete from S3
    try {
      // Extract key from URL
      // URL format: https://bucket.s3.amazonaws.com/uploads/123-file.png
      const key = file.fileUrl.split(".amazonaws.com/")[1];

      if (key) {
        const command = new DeleteObjectCommand({
          Bucket: env.AWS_BUCKET_NAME!,
          Key: key,
        });
        await s3.send(command);
      }
    } catch (error) {
      console.error("S3 Delete Error:", error);
      // Continue even if S3 delete fails (or handle as needed)
    }

    // 2. Delete from Prisma
    await prisma.fileUpload.delete({
      where: { id: fileId },
    });

    // 3. Emit event
    eventBus.emit(EventTypes.FILE_DELETED, {
      workspaceId: file.workspaceId,
      userId: req.user.id,
      fileId: file.id,
      fileName: file.fileName,
    });

    return res.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};