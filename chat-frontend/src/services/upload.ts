import api from './api';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  messageId?: string;
}

class UploadService {
  async uploadFile(
    file: File,
    chatId: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('chatId', chatId);
    formData.append('messageType', file.type.startsWith('image/') ? 'image' : 'file');

    try {
      const response = await api.post('/upload/file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress: UploadProgress = {
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total),
            };
            onProgress(progress);
          }
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Upload failed');
    }
  }

  async uploadAvatar(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await api.post('/upload/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Avatar upload failed');
    }
  }

  validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/zip',
    ];

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size must be less than 10MB. Current size: ${this.formatFileSize(file.size)}`,
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type not supported: ${file.type}`,
      };
    }

    return { valid: true };
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export default new UploadService();
