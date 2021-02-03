import fetch from 'isomorphic-unfetch';

const apiHost = process.env.API_HOST;
const accessToken = process.env.ACCESS_TOKEN;

export default async (req, res) => {
  const header = new Headers();
  header.set('Authorization', `Bearer ${accessToken}`);

  const prompts = await fetch(`${apiHost}/prompt`, {
    method: 'GET',
    headers: header,
  }).then((response) => response.json());
  res.end(JSON.stringify(prompts));
};
