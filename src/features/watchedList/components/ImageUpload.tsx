import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { IoCloudUpload, IoClose, IoImage, IoWarning } from 'react-icons/io5';
import { cn } from '@/utils/helper';

export interface ImageFile {
  id: string;
  file: string; // base64 encoded
  name: string;
  size: number;
  preview?: string;
}

interface ImageUploadProps {
  images: ImageFile[];
  onImagesChange: (images: ImageFile[]) => void;
  maxImages?: number;
  maxFileSize?: number; // in MB
  className?: string;
}

const ImageUpload = ({
  images,
  onImagesChange,
  maxImages = 5,
  maxFileSize = 5,
  className = ''
}: ImageUploadProps) => {
  const [error, setError] = useState<string>('');

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const resizeImage = (file: File, maxWidth = 800, maxHeight = 600, quality = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        let { width, height } = img;
        
        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          async (blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              const base64 = await convertToBase64(resizedFile);
              resolve(base64);
            } else {
              reject(new Error('Failed to resize image'));
            }
          },
          file.type,
          quality
        );
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    setError('');
    
    // Check for rejected files
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(file => {
        if (file.errors.some((e: any) => e.code === 'file-too-large')) {
          return `${file.file.name} is too large (max ${maxFileSize}MB)`;
        }
        if (file.errors.some((e: any) => e.code === 'file-invalid-type')) {
          return `${file.file.name} is not a valid image type`;
        }
        return `${file.file.name} was rejected`;
      });
      setError(errors.join(', '));
      return;
    }

    // Check total image count
    if (images.length + acceptedFiles.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    try {
      const processedImages = await Promise.all(
        acceptedFiles.map(async (file) => {
          const resizedBase64 = await resizeImage(file);
          
          return {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            file: resizedBase64,
            name: file.name,
            size: file.size,
            preview: resizedBase64
          };
        })
      );

      onImagesChange([...images, ...processedImages]);
    } catch (error) {
      setError('Failed to process images. Please try again.');
    }
  }, [images, onImagesChange, maxImages, maxFileSize]);

  const removeImage = (imageId: string) => {
    const updatedImages = images.filter(img => img.id !== imageId);
    onImagesChange(updatedImages);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxSize: maxFileSize * 1024 * 1024,
    disabled: images.length >= maxImages
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200',
          isDragActive
            ? 'border-blue-500 bg-blue-500/10'
            : images.length >= maxImages
            ? 'border-gray-600 bg-gray-800/50 cursor-not-allowed'
            : 'border-gray-600 hover:border-blue-500 hover:bg-gray-800/50',
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center gap-3">
          <div className={cn(
            'p-3 rounded-full',
            isDragActive ? 'bg-blue-500/20' : 'bg-gray-700'
          )}>
            <IoCloudUpload 
              size={32} 
              className={cn(
                isDragActive ? 'text-blue-400' : 'text-gray-400'
              )}
            />
          </div>
          
          <div>
            <p className="text-white font-medium mb-1">
              {images.length >= maxImages 
                ? `Maximum ${maxImages} images reached`
                : isDragActive
                ? 'Drop images here...'
                : 'Upload Memory Images'
              }
            </p>
            {images.length < maxImages && (
              <p className="text-gray-400 text-sm">
                Drag & drop or click to select images (max {maxFileSize}MB each)
              </p>
            )}
          </div>
          
          <div className="text-xs text-gray-500">
            {images.length}/{maxImages} images • JPG, PNG, GIF, WebP
          </div>
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-3 bg-red-900/30 border border-red-700 rounded-lg"
          >
            <IoWarning className="text-red-400 flex-shrink-0" />
            <p className="text-red-300 text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-white font-medium text-sm flex items-center gap-2">
            <IoImage size={16} />
            Uploaded Images ({images.length})
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <AnimatePresence>
              {images.map((image) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative group bg-gray-800 rounded-lg overflow-hidden aspect-square"
                >
                  <img
                    src={image.preview || image.file}
                    alt={image.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <button
                      onClick={() => removeImage(image.id)}
                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors duration-200"
                      title="Remove image"
                    >
                      <IoClose size={16} />
                    </button>
                  </div>
                  
                  {/* Info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <p className="text-white text-xs truncate">{image.name}</p>
                    <p className="text-gray-300 text-xs">{formatFileSize(image.size)}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;