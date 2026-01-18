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
