// backend/helpers/cloudinary.js
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { Readable } = require('stream');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Force HTTPS for all URLs
});

// Memory storage for multer
const storage = multer.memoryStorage();

// File filter - only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Multer upload configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

/**
 * Ensure URL uses HTTPS protocol
 * @param {string} url - URL to convert
 * @returns {string} - HTTPS URL
 */
function ensureHttpsUrl(url) {
  if (!url) return url;
  
  // If URL starts with http://, replace with https://
  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }
  
  // If URL doesn't have a protocol but looks like a Cloudinary URL
  if (!url.startsWith('https://') && !url.startsWith('http://')) {
    if (url.includes('cloudinary.com') || url.includes('res.cloudinary')) {
      return `https://${url}`;
    }
  }
  
  return url;
}

/**
 * Upload image to Cloudinary
 * @param {Buffer} fileBuffer - Image buffer from multer
 * @param {string} folder - Cloudinary folder (default: 'products')
 * @param {Object} options - Additional Cloudinary options
 * @returns {Promise<Object>} - Cloudinary upload result with HTTPS URLs
 */
async function uploadImageToCloudinary(fileBuffer, folder = 'products', options = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        secure: true, // Force HTTPS
        transformation: [
          { quality: 'auto:best' },
          { fetch_format: 'auto' },
        ],
        ...options,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          // Ensure all URLs are HTTPS
          const secureResult = {
            ...result,
            url: ensureHttpsUrl(result.url),
            secure_url: ensureHttpsUrl(result.secure_url || result.url),
          };
          resolve(secureResult);
        }
      }
    );

    // Convert buffer to stream and pipe to cloudinary
    const bufferStream = Readable.from(fileBuffer);
    bufferStream.pipe(uploadStream);
  });
}

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} - Deletion result
 */
async function deleteImageFromCloudinary(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
}

/**
 * Delete multiple images from Cloudinary
 * @param {Array<string>} publicIds - Array of Cloudinary public IDs
 * @returns {Promise<Object>} - Deletion result
 */
async function deleteMultipleImages(publicIds) {
  try {
    // Filter out any null or undefined values
    const validPublicIds = publicIds.filter(id => id && id.trim());
    
    if (validPublicIds.length === 0) {
      return { deleted: {}, deleted_counts: { original: 0 } };
    }

    const result = await cloudinary.api.delete_resources(validPublicIds);
    return result;
  } catch (error) {
    console.error('Cloudinary bulk delete error:', error);
    throw error;
  }
}

/**
 * Extract public ID from Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string|null} - Public ID or null
 */
function extractPublicId(url) {
  if (!url) return null;
  
  try {
    // Ensure URL is a string
    const urlString = String(url).trim();
    
    // Handle HTTPS URLs
    const httpsUrl = ensureHttpsUrl(urlString);
    
    // Extract public ID from URL
    // Example: https://res.cloudinary.com/demo/image/upload/v1234567890/products/image_id.jpg
    // or: https://res.cloudinary.com/demo/image/upload/products/image_id.jpg
    
    // Method 1: Try with version number
    let matches = httpsUrl.match(/\/upload\/v\d+\/(.+?)(?:\.\w+)?$/);
    if (matches && matches[1]) {
      return matches[1];
    }
    
    // Method 2: Try without version number
    matches = httpsUrl.match(/\/upload\/(.+?)(?:\.\w+)?$/);
    if (matches && matches[1]) {
      return matches[1];
    }
    
    // Method 3: Handle URLs with transformations
    matches = httpsUrl.match(/\/upload\/[^/]+\/(.+?)(?:\.\w+)?$/);
    if (matches && matches[1]) {
      return matches[1];
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
}

/**
 * Generate optimized image URL with HTTPS
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} transformations - Transformation options
 * @returns {string} - Optimized HTTPS URL
 */
function getOptimizedImageUrl(publicId, transformations = {}) {
  const url = cloudinary.url(publicId, {
    secure: true, // Force HTTPS
    quality: 'auto:good',
    fetch_format: 'auto',
    ...transformations,
  });
  
  return ensureHttpsUrl(url);
}

/**
 * Batch upload multiple images
 * @param {Array<Buffer>} fileBuffers - Array of image buffers
 * @param {string} folder - Cloudinary folder
 * @param {Object} options - Upload options
 * @returns {Promise<Array>} - Array of upload results
 */
async function batchUploadImages(fileBuffers, folder = 'products', options = {}) {
  try {
    const uploadPromises = fileBuffers.map(buffer => 
      uploadImageToCloudinary(buffer, folder, options)
    );
    
    const results = await Promise.allSettled(uploadPromises);
    
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return {
          success: true,
          data: result.value,
        };
      } else {
        return {
          success: false,
          error: result.reason.message,
          index,
        };
      }
    });
  } catch (error) {
    console.error('Batch upload error:', error);
    throw error;
  }
}

/**
 * Validate image URL is from Cloudinary and uses HTTPS
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid and secure
 */
function isValidCloudinaryUrl(url) {
  if (!url || typeof url !== 'string') return false;
  
  const httpsUrl = ensureHttpsUrl(url);
  
  // Check if it's a Cloudinary URL and uses HTTPS
  return httpsUrl.startsWith('https://') && 
         (httpsUrl.includes('cloudinary.com') || httpsUrl.includes('res.cloudinary'));
}

/**
 * Sanitize and secure image URLs array
 * @param {Array<string>} urls - Array of image URLs
 * @returns {Array<string>} - Array of HTTPS URLs
 */
function sanitizeImageUrls(urls) {
  if (!Array.isArray(urls)) return [];
  
  return urls
    .filter(url => url && typeof url === 'string')
    .map(url => ensureHttpsUrl(url.trim()))
    .filter(url => isValidCloudinaryUrl(url));
}

/**
 * Get image metadata from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} - Image metadata
 */
async function getImageMetadata(publicId) {
  try {
    const result = await cloudinary.api.resource(publicId, {
      image_metadata: true,
      colors: true,
      phash: true,
    });
    
    return {
      ...result,
      url: ensureHttpsUrl(result.url),
      secure_url: ensureHttpsUrl(result.secure_url),
    };
  } catch (error) {
    console.error('Get image metadata error:', error);
    throw error;
  }
}

/**
 * Generate responsive image URLs
 * @param {string} publicId - Cloudinary public ID
 * @param {Array<number>} widths - Array of widths for responsive images
 * @returns {Object} - Object with responsive URLs
 */
function getResponsiveImageUrls(publicId, widths = [320, 640, 768, 1024, 1280, 1536]) {
  const urls = {};
  
  widths.forEach(width => {
    urls[`w${width}`] = getOptimizedImageUrl(publicId, {
      width,
      crop: 'limit',
      quality: 'auto:good',
    });
  });
  
  return urls;
}

module.exports = {
  upload,
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
  deleteMultipleImages,
  extractPublicId,
  getOptimizedImageUrl,
  ensureHttpsUrl,
  batchUploadImages,
  isValidCloudinaryUrl,
  sanitizeImageUrls,
  getImageMetadata,
  getResponsiveImageUrls,
  cloudinary,
};