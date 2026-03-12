export async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Server returned error: ${errText}`);
  }

  return response.json();
}
