/**
 * Triggers a browser download for the given data.
 * @param {string|Blob} data The data to be downloaded.
 * @param {string} filename The name of the file to be saved.
 * @param {string} type The MIME type of the file (e.g., 'application/json', 'text/csv').
 */
export const downloadData = (data, filename, type) => {
  // Create a new Blob object using the data
  const blob = new Blob([data], { type });

  // Create an anchor element and a URL for the blob
  const a = document.createElement('a');
  a.href = window.URL.createObjectURL(blob);
  a.download = filename;

  // Append the anchor to the body, trigger a click, and then remove it
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Revoke the blob URL to free up memory
  window.URL.revokeObjectURL(a.href);
};