/**
 * Image utility functions for compressing and processing images
 */

/**
 * Compress an image file to reduce its size while maintaining reasonable quality
 * @param {File} file - The image file to compress
 * @param {number} maxWidth - Maximum width of the compressed image (default: 1200)
 * @param {number} maxHeight - Maximum height of the compressed image (default: 800)
 * @param {number} quality - Image quality (0.1 to 1.0, default: 0.8)
 * @returns {Promise<File>} - The compressed image file
 */
export const compressImage = (file, maxWidth = 1200, maxHeight = 800, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height;
        
        if (width > height) {
          width = maxWidth;
          height = width / aspectRatio;
          
          if (height > maxHeight) {
            height = maxHeight;
            width = height * aspectRatio;
          }
        } else {
          height = maxHeight;
          width = height * aspectRatio;
          
          if (width > maxWidth) {
            width = maxWidth;
            height = width / aspectRatio;
          }
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw the image on canvas with new dimensions
      ctx.drawImage(img, 0, 0, width, height);

      // Convert canvas to blob
      canvas.toBlob(
        (blob) => {
          // Create a new File from the blob
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        },
        'image/jpeg',
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
};

/**
 * Convert image file to base64 with compression
 * @param {File} file - The image file
 * @param {number} maxSize - Maximum file size in bytes (default: 500KB)
 * @returns {Promise<string>} - Base64 encoded image
 */
export const convertToCompressedBase64 = async (file, maxSize = 500 * 1024) => {
  let compressedFile = file;
  let quality = 0.8;
  
  // Compress until file is under maxSize or quality is too low
  while (compressedFile.size > maxSize && quality > 0.1) {
    compressedFile = await compressImage(file, 1200, 800, quality);
    quality -= 0.1;
  }
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(compressedFile);
  });
};

/**
 * Validate image file
 * @param {File} file - The image file to validate
 * @param {number} maxSize - Maximum file size in bytes (default: 10MB)
 * @returns {Object} - Validation result with isValid and error message
 */
export const validateImage = (file, maxSize = 10 * 1024 * 1024) => {
  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      error: 'Please upload a valid image file (JPEG, PNG, GIF, or WebP)' 
    };
  }

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return { 
      isValid: false, 
      error: `Image size should be less than ${maxSizeMB}MB` 
    };
  }

  return { isValid: true, error: null };
};

/**
 * Upload image using multiple methods with fallback
 * @param {File} file - The image file to upload
 * @param {Function} onProgress - Progress callback function
 * @returns {Promise<string>} - Image URL
 */
export const uploadImage = async (file, onProgress = () => {}) => {
  const validation = validateImage(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  let imageUrl = null;

  // Method 1: Try ImgBB
  onProgress('Trying ImgBB upload...');
  try {
    const compressedFile = await compressImage(file);
    const formData = new FormData();
    formData.append('image', compressedFile);

    const response = await fetch('https://api.imgbb.com/1/upload?key=b0ea2f6cc0f276633b2a8a86d2c43335', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (data && data.data && data.data.display_url) {
      imageUrl = data.data.display_url;
      console.log('ImgBB upload successful:', imageUrl);
      return imageUrl;
    }
  } catch (imgbbError) {
    console.log('ImgBB failed, trying alternative method:', imgbbError.message);
  }

  // Method 2: Try Cloudinary
  if (!imageUrl) {
    onProgress('Trying Cloudinary upload...');
    try {
      const compressedFile = await compressImage(file);
      const formData = new FormData();
      formData.append('file', compressedFile);
      formData.append('upload_preset', 'ml_default');

      const response = await fetch('https://api.cloudinary.com/v1_1/demo/image/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data && data.secure_url) {
        imageUrl = data.secure_url;
        console.log('Cloudinary upload successful:', imageUrl);
        return imageUrl;
      }
    } catch (cloudinaryError) {
      console.log('Cloudinary failed, using compressed base64 fallback:', cloudinaryError.message);
    }
  }

  // Method 3: Compressed Base64 fallback (last resort)
  if (!imageUrl) {
    onProgress('Using compressed local storage...');
    try {
      // Use very aggressive compression for base64
      const compressedBase64 = await convertToCompressedBase64(file, 100 * 1024); // 100KB max
      imageUrl = compressedBase64;
      console.log('Using compressed base64 fallback');
      return imageUrl;
    } catch (base64Error) {
      throw new Error('All upload methods failed including compression');
    }
  }

  throw new Error('Failed to upload image');
};

/**
 * Create a preview URL for an image file
 * @param {File} file - The image file
 * @returns {string} - Object URL for preview
 */
export const createPreviewURL = (file) => {
  return URL.createObjectURL(file);
};

/**
 * Cleanup preview URL to free memory
 * @param {string} url - The object URL to cleanup
 */
export const cleanupPreviewURL = (url) => {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};