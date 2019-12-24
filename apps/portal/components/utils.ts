/** @format */

export const toBase64 = (file: Blob): Promise<string | ArrayBuffer> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64result = (reader.result as string).split(',');

      if (base64result.length === 2) {
        resolve(base64result[1]);
      }

      reject(new Error('error'));
    };
    reader.onerror = (error) => reject(error);
  });
