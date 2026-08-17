/** Konversi fileList antd Upload menjadi string URL (Cloudinary atau base64). */
export async function getImageString(imageValue: any): Promise<string> {
  if (!imageValue) return "";
  if (typeof imageValue === "string") return imageValue;

  // Handle Ant Design Upload file list
  if (Array.isArray(imageValue) && imageValue.length > 0) {
    const file = imageValue[0];
    if (file.url) return file.url;
    if (file.response?.data?.url) return file.response.data.url;
    if (file.originFileObj) {
      return fileToBase64(file.originFileObj);
    }
    if (file.thumbUrl) return file.thumbUrl;
  }

  // Handle single file object
  if (imageValue.originFileObj) {
    return fileToBase64(imageValue.originFileObj);
  }

  return "";
}

/** Konversi fileList antd Upload menjadi array string URL (Cloudinary atau base64). */
export async function getImagesArray(imageValue: any): Promise<string[]> {
  if (!imageValue || !Array.isArray(imageValue)) return [];
  const results: string[] = [];
  for (const file of imageValue) {
    if (file.url) {
      results.push(file.url);
    } else if (file.response?.data?.url) {
      results.push(file.response.data.url);
    } else if (file.originFileObj) {
      results.push(await fileToBase64(file.originFileObj));
    } else if (file.thumbUrl) {
      results.push(file.thumbUrl);
    }
  }
  return results;
}

/** Konversi File menjadi data URL base64. */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}
