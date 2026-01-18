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

/**
 * 生成带时间戳的文件名
 * @param prefix - 文件名前缀
 * @param date - 日期字符串
 * @param extension - 文件扩展名（默认 jpg）
 */
export const generateFilename = (prefix: string, date: string, extension: string = 'jpg'): string => {
  const dateStr = new Date(date).toISOString().split('T')[0];
  return `${prefix}_${dateStr}.${extension}`;
};
