// The `download` attribute is ignored for cross-origin URLs (a MinIO presigned URL
// is one, and it isn't served with Content-Disposition: attachment), so the browser
// would just open the file. Fetch it and save the blob instead; if the fetch is
// blocked (e.g. CORS), fall back to opening the URL in a new tab.
export async function downloadFile(url: string, fileName: string) {
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Download failed: ${response.status}`)

    const objectUrl = URL.createObjectURL(await response.blob())
    const link = document.createElement("a")
    link.href = objectUrl
    link.download = fileName
    document.body.append(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(objectUrl)
  } catch {
    window.open(url, "_blank", "noopener,noreferrer")
  }
}
