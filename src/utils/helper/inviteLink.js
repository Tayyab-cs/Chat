import { customAlphabet } from 'nanoid';

const alphabet =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 20);

export const generateInvitationCode = (groupName) => {
  const code = nanoid();
  return `${groupName}-${code}`;
};
