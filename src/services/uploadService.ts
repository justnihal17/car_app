import api from '../api/axios';

/**
 * Uploads a single image File object to Cloudinary via POST /upload/image.
 * Returns the uploaded Cloudinary image URL.
 * Throws an Error if the upload fails.
 */
export async function uploadImage(file: File): Promise<string> {
  if (!file) {
    throw new Error('No file provided for upload');
  }

  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (response.data?.success === false) {
    throw new Error(response.data?.message || 'Failed to upload image to server');
  }

  const imageUrl = response.data?.url || 
                   response.data?.data?.url || 
                   response.data?.imageUrl || 
                   response.data?.profileUrl || 
                   response.data?.data || 
                   (typeof response.data === 'string' ? response.data : null);

  if (!imageUrl || typeof imageUrl !== 'string') {
    throw new Error('Upload server did not return a valid image URL');
  }

  return imageUrl;
}
