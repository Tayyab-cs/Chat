import fetch from 'node-fetch';

export const chatToken = async (data) => {
  const rawResponse = await fetch('http://localhost:3002/api/chat', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (rawResponse) return rawResponse;
  console.log('Chat Token not created.');
};
