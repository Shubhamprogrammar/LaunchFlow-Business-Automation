import { prisma } from "../../config/prisma";

export const createWorkspaceService = async (
    userId: string,
    name: string
) => {
    try {
        return await prisma.workspace.create({
            data: {
                slug: name.toLowerCase().replace(/ /g, "-"),
                name,
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
    } catch (error) {
        console.log(error);
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
        console.log(error);
        throw error;
    }
};