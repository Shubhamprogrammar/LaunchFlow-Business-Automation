import { addWelcomeEmailJob } from "../jobs/email.jobs";

export const handleUserCreated = async (user: {
  id: string;
  email: string;
  name?: string;
}) => {
  await addWelcomeEmailJob({
    email: user.email,
    name: user.name || "there",
  });
};