import FormData from 'form-data';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

export const uploadImage = async (buffer: Buffer, width: string = '0', height: string = '0') => {
  const formData = new FormData();
  formData.append('width', width);
  formData.append('height', height);
  formData.append('allowMimes[0]', 'image/png');
  formData.append('allowMimes[1]', 'image/jpeg');
  formData.append('file', buffer, {
    contentType: 'image/jpeg',
    filename: 'image.jpg',
  });
  const response = await fetch(`${process.env.SERVER_FILE_MANAGER}/api/upload`, {
    method: 'POST',
    body: formData,
    headers: {
      'x-app-name': process.env.APP_NAME!
    }
  });
  const data = await response.json();
  return data;
}

export const uploadImages = async (buffers: Buffer[], width: string = '0', height: string = '0') => {
    const formData = new FormData();
    formData.append('width', width);
    formData.append('height', height);
    formData.append('allowMimes[0]', 'image/png');
    formData.append('allowMimes[1]', 'image/jpeg');
    for (const buffer of buffers) {
      formData.append('files', buffer, {
        contentType: 'image/jpeg',
        filename: 'image.jpg',
      });
    }
    const response = await fetch(`${process.env.SERVER_FILE_MANAGER}/api/uploads`, {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json, text/plain, */*',
        'User-Agent': '*',
        'x-app-name': process.env.APP_NAME!
      }
    });
    const data = await response.json();
    return data;

}