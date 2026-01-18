import heic2any from 'heic2any';

/**
 * 处理图片文件上传，支持 HEIC 格式自动转换
 * @param file - 上传的文件
 * @returns Promise<string> - base64 格式的图片数据
 */
export const handleImageUpload = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // 检查是否是 HEIC 格式
    const isHEIC = file.type === 'image/heic' || 
                   file.type === 'image/heif' || 
                   file.name.toLowerCase().endsWith('.heic') ||
                   file.name.toLowerCase().endsWith('.heif');

    if (isHEIC) {
      // 转换 HEIC 为 JPEG
      heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.9
      })
        .then((convertedBlob) => {
          const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve(e.target?.result as string);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
        .catch(reject);
    } else {
      // 普通图片直接读取
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    }
  });
};

export const compressImageDataUrl = async (
  dataUrl: string,
  options?: { maxWidth?: number; quality?: number }
): Promise<string> => {
  const maxWidth = options?.maxWidth ?? 1600;
  const quality = options?.quality ?? 0.75;

  return new Promise((resolve, reject) => {
    if (!dataUrl.startsWith('data:image/')) {
      resolve(dataUrl);
      return;
    }

    if (dataUrl.startsWith('data:image/gif')) {
      resolve(dataUrl);
      return;
    }

    const img = new Image();
    img.onload = () => {
      if (!img.width || !img.height) {
        resolve(dataUrl);
        return;
      }

      const scale = Math.min(maxWidth / img.width, 1);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
};

/**
 * 生成下载文件名
 * @param prefix - 文件名前缀
 * @param date - 日期字符串
 * @returns 格式化的文件名
 */
export const generateFilename = (prefix: string, date: string): string => {
  const dateStr = new Date(date).toISOString().split('T')[0];
  return `${prefix}_${dateStr}.jpg`;
};

/**
 * 下载图片到本地
 * @param imageUrl - 图片 URL 或 base64 数据
 * @param filename - 保存的文件名
 */
export const downloadImage = (imageUrl: string, filename: string) => {
  const link = document.createElement('a');
  link.href = imageUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
