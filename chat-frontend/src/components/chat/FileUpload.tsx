import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Alert,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface FileUploadProps {
  open: boolean;
  onClose: () => void;
  chatId: string;
  onFileUploaded: (message: any) => void;
}

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  preview?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  open,
  onClose,
  chatId,
  onFileUploaded
}) => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain', 'application/zip'
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    const validFiles = selectedFiles.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} is too large. Max size is 10MB.`);
        return false;
      }
      
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${file.name} is not a supported file type.`);
        return false;
      }
      
      return true;
    });

    const newFiles: UploadFile[] = validFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      status: 'pending',
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }));

    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    
    for (const uploadFile of files) {
      if (uploadFile.status !== 'pending') continue;
      
      try {
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id ? { ...f, status: 'uploading' } : f
        ));

        const formData = new FormData();
        formData.append('file', uploadFile.file);
        formData.append('chatId', chatId);
        formData.append('messageType', uploadFile.file.type.startsWith('image/') ? 'image' : 'file');

        const response = await api.post('/chat/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            
            setFiles(prev => prev.map(f => 
              f.id === uploadFile.id ? { ...f, progress } : f
            ));
          },
        });

        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id ? { ...f, status: 'completed', progress: 100 } : f
        ));

        if (response.data.message) {
          onFileUploaded(response.data.message);
        }

      } catch (error: any) {
        console.error('Upload failed:', error);
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id ? { ...f, status: 'error' } : f
        ));
        toast.error(`Failed to upload ${uploadFile.file.name}`);
      }
    }
    
    setIsUploading(false);
    
    // Close dialog if all uploads completed
    const allCompleted = files.every(f => f.status === 'completed' || f.status === 'error');
    if (allCompleted) {
      setTimeout(() => {
        onClose();
        setFiles([]);
      }, 1000);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <ImageIcon />;
    return <FileIcon />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Upload Files</DialogTitle>
      <DialogContent>
        <Box
          sx={{
            border: '2px dashed',
            borderColor: 'grey.300',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            cursor: 'pointer',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'action.hover',
            },
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
          <Typography variant="h6" gutterBottom>
            Click to select files
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Max size: 10MB per file
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Supported: Images, PDF, Word, Text, ZIP
          </Typography>
        </Box>

        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept={ALLOWED_TYPES.join(',')}
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />

        {files.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Selected Files ({files.length})
            </Typography>
            
            <List>
              {files.map((uploadFile) => (
                <ListItem
                  key={uploadFile.id}
                  secondaryAction={
                    !isUploading && uploadFile.status === 'pending' && (
                      <IconButton
                        edge="end"
                        onClick={() => removeFile(uploadFile.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )
                  }
                >
                  <ListItemIcon>
                    {uploadFile.preview ? (
                      <img
                        src={uploadFile.preview}
                        alt={uploadFile.file.name}
                        style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
                      />
                    ) : (
                      getFileIcon(uploadFile.file)
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={uploadFile.file.name}
                    secondary={
                      <Box>
                        <Typography variant="body2">
                          {formatFileSize(uploadFile.file.size)}
                        </Typography>
                        {uploadFile.status === 'uploading' && (
                          <LinearProgress
                            variant="determinate"
                            value={uploadFile.progress}
                            sx={{ mt: 1 }}
                          />
                        )}
                        {/* FIXED: Removed size prop, used sx for styling */}
                        {uploadFile.status === 'error' && (
                          <Alert severity="error" sx={{ mt: 1, fontSize: '0.875rem', py: 0.5 }}>
                            Upload failed
                          </Alert>
                        )}
                        {uploadFile.status === 'completed' && (
                          <Alert severity="success" sx={{ mt: 1, fontSize: '0.875rem', py: 0.5 }}>
                            Upload completed
                          </Alert>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={isUploading}>
          Cancel
        </Button>
        <Button
          onClick={uploadFiles}
          disabled={files.length === 0 || isUploading}
          variant="contained"
          startIcon={<SendIcon />}
        >
          {isUploading ? 'Uploading...' : `Upload ${files.length} file(s)`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FileUpload;
