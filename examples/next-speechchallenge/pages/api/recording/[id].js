import fetch from 'isomorphic-unfetch';

const apiHost = process.env.API_HOST;
const accessToken = process.env.ACCESS_TOKEN;

export default async function recordingHandler({ query: { id } }, res) {
  const header = new Headers();
  header.set('Authorization', `Bearer ${accessToken}`);

  const recording = await fetch(`${apiHost}/recording/${id}/audio`, {
    method: 'GET',
    headers: header,
  });
  res.setHeader('Content-Type', 'audio/wav');
  res.end(await recording.buffer(), 'binary');
}
