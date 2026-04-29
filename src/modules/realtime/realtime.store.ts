type Client = {
  userId: string;
  res: any;
};

export const clients: Client[] = [];

export const addClient = (userId: string, res: any) => {
  clients.push({ userId, res });
};

export const removeClient = (res: any) => {
  const index = clients.findIndex((c) => c.res === res);
  if (index !== -1) clients.splice(index, 1);
};

export const sendToUser = (userId: string, event: string, data: any) => {
  clients
    .filter((c) => c.userId === userId)
    .forEach((client) => {
      client.res.write(`event: ${event}\n`);
      client.res.write(`data: ${JSON.stringify(data)}\n\n`);
    });
};
