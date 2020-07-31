/** @format */

export const toBase64 = (file: Blob): Promise<string | ArrayBuffer> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.addEventListener('load', () => {
      const base64result = (reader.result as string).split(',');

      if (base64result.length === 2) {
        resolve(base64result[1]);
      }

      reject(new Error('some happened with toBase64'));
    });
    reader.addEventListener('error', (error) => reject(error));
  });

// TODO: надо потестировать как оно работает
export const resizeImage = (file: Blob): Promise<string | ArrayBuffer> =>
  new Promise((resolve, reject) => {
    const MAX_WIDTH = 250;
    const MAX_HEIGHT = 250;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.addEventListener('load', (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.addEventListener('load', () => {
        const element = document.createElement('canvas');
        let { width, height } = img;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }

        element.width = width;
        element.height = height;

        const ctx = element.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          ctx.canvas.toBlob((blob: Blob | null) => {
            blob && resolve(toBase64(blob));
          });
        }
      });

      reader.addEventListener('error', (error) => reject(error));
    });
  });
