import { prisma } from "../../config/prisma";

export const getWorkspaceMembersService = async (
  workspaceId: string
) => {
  return prisma.membership.findMany({
    where: { workspaceId },
    orderBy: {
      createdAt: "asc",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          status: true,
        },
      },
    },
  });
};

export const updateMemberRoleService = async (
  membershipId: string,
  role: "ADMIN" | "MANAGER" | "MEMBER"
) => {
  const membership = await prisma.membership.findUnique({
    where: { id: membershipId },
  });

  if (!membership) {
    const error: any = new Error("Member not found");
    error.statusCode = 404;
    throw error;
  }

  if (membership.role === "OWNER") {
    const error: any = new Error("Owner role cannot be changed");
    error.statusCode = 403;
    throw error;
  }

  return prisma.membership.update({
    where: { id: membershipId },
    data: { role },
  });
};

export const removeMemberService = async (
  membershipId: string
) => {
  const membership = await prisma.membership.findUnique({
    where: { id: membershipId },
  });

  if (!membership) {
    const error: any = new Error("Member not found");
    error.statusCode = 404;
    throw error;
  }

  if (membership.role === "OWNER") {
    const error: any = new Error("Owner cannot be removed");
    error.statusCode = 403;
    throw error;
  }

  await prisma.membership.delete({
    where: { id: membershipId },
  });

  return true;
};