/**
 * Client library for uploading files to S3 using signed URLs
 */

/**
 * Request a signed URL from the server
 * 
 * @param {Object} options - Options for the signed URL request
 * @param {string} options.fileName - Original file name
 * @param {string} options.contentType - MIME type of the file
 * @param {string} options.directory - Directory in the bucket to store the file (optional)
 * @param {string} options.endpoint - API endpoint to request the signed URL (default: '/api/s3/sign')
 * @returns {Promise<Object>} Object containing the signed URL and file information
 */
export async function getSignedUploadUrl({
    fileName,
    contentType,
    directory,
    endpoint = '/api/s3/sign',
}) {
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            fileName,
            contentType,
            directory,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get signed URL');
    }

    return response.json();
}

/**
 * Upload a file to S3 using a signed URL
 * 
 * @param {Object} options - Upload options
 * @param {File|Blob} options.file - File or Blob to upload
 * @param {string} options.signedUrl - Signed URL for the upload
 * @param {Function} options.onProgress - Progress callback (optional)
 * @returns {Promise<Object>} Upload result
 */
export async function uploadFileWithSignedUrl({
    file,
    signedUrl,
    onProgress,
}) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Set up progress tracking if callback provided
        if (onProgress && typeof onProgress === 'function') {
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = (event.loaded / event.total) * 100;
                    onProgress(percentComplete);
                }
            };
        }

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve({
                    success: true,
                    status: xhr.status,
                });
            } else {
                reject(new Error(`Upload failed with status ${xhr.status}`));
            }
        };

        xhr.onerror = () => {
            reject(new Error('Upload failed'));
        };

        xhr.open('PUT', signedUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
    });
}

/**
 * Convenience function to get a signed URL and upload a file in one call
 * 
 * @param {Object} options - Upload options
 * @param {File|Blob} options.file - File or Blob to upload
 * @param {string} options.directory - Directory in the bucket to store the file (optional)
 * @param {string} options.endpoint - API endpoint to request the signed URL (default: '/api/s3/sign')
 * @param {Function} options.onProgress - Progress callback (optional)
 * @returns {Promise<Object>} Upload result with file URL and key
 */
export async function uploadToS3({
    file,
    directory = 'uploads',
    endpoint = '/api/s3/sign',
    onProgress = () => { },
}) {
    // Get signed URL
    const { signedUrl, key, url } = await getSignedUploadUrl({
        fileName: file.name,
        contentType: file.type,
        directory,
        endpoint,
    });

    // Upload the file
    await uploadFileWithSignedUrl({
        file,
        signedUrl,
        onProgress,
    });

    // Return the file information
    return {
        key,
        url,
        fileName: file.name,
        contentType: file.type,
    };
} 