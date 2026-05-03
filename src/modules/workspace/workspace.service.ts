import { prisma } from "../../config/prisma";
import { eventBus } from "../events/event.bus";
import { EventTypes } from "../events/event.types";

const generateSlug = (name: string) => {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
};

export const createWorkspaceService = async (
  userId: string,
  name: string
) => {
  const cleanName = name.trim();

  if (!cleanName) {
    throw new Error("Workspace name is required");
  }

  let baseSlug = generateSlug(cleanName);
  let slug = baseSlug;

  let counter = 1;

  while (await prisma.workspace.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter++}`;
  }

  try {
    const workspace = await prisma.$transaction(async (tx) => {
      return await tx.workspace.create({
        data: {
          name: cleanName,
          slug,
          ownerId: userId,

          memberships: {
            create: {
              userId,
              role: "OWNER",
            },
          },
        },

        include: {
          memberships: true,
        },
      });
    });

    eventBus.emit(EventTypes.WORKSPACE_CREATED, {
      userId,
      workspaceId: workspace.id,
      workspaceName: workspace.name,
    });

    return workspace;
  } catch (error) {
    throw error;
  }
};

export const getMyWorkspacesService = async (userId: string) => {
    try{
        return await prisma.workspace.findMany({
            where: {
                memberships: {
                    some: {
                        userId,
                    },
                },
            },
        });
    }
    catch (error) {
        throw error;
    }
};