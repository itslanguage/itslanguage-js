import fetch from 'isomorphic-unfetch';

export default async function fetchy(...args) {
  const res = await fetch(...args);
  return res.json();
}
