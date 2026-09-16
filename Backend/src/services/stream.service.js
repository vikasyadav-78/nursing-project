import { prisma } from "../database/prisma.js";

export const createStream = async (data) => {
  const existing = await prisma.stream.findFirst({
    where: { name: data.name },
  });

  if (existing) {
    throw new Error("Stream with this name already exists");
  }

  return await prisma.stream.create({
    data,
  });
};

export const getStreams = async () => {
  return await prisma.stream.findMany();
};

export const deleteStream = async (id) => {
  return await prisma.stream.delete({
    where: { id: String(id) },
  });
};
