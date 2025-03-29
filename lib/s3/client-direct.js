import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from 'crypto';

// Initialize the S3 client with environment variables from the browser
// Note: This approach exposes your AWS credentials to the client
// Use with caution and consider implementing proper authentication
const s3Client = new S3Client({
    region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
    },
});

/**
 * Generate a signed URL for uploading a file to S3 directly from the client
 */
export async function generateSignedUploadUrl({
    fileName,
    contentType,
    directory = 'uploads',
    expiresIn = 3600,
}) {
    if (!fileName || !contentType) {
        throw new Error('fileName and contentType are required');
    }

    // Generate a unique file key
    const fileExtension = fileName.split('.').pop();
    const randomId = crypto.randomBytes(16).toString('hex');
    const sanitizedFileName = fileName
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .toLowerCase();

    const key = `${directory}/${randomId}-${sanitizedFileName}`;

    const command = new PutObjectCommand({
        Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET,
        Key: key,
        ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });

    return {
        signedUrl,
        key,
        url: `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET}.s3.${process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`,
    };
}

/**
 * Upload a file to S3 using a signed URL
 */
export async function uploadFileWithSignedUrl({
    file,
    signedUrl,
    onProgress,
}) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

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
 */
export async function uploadToS3({
    file,
    directory,
    onProgress,
}) {
    // Generate signed URL directly on the client
    const { signedUrl, key, url } = await generateSignedUploadUrl({
        fileName: file.name,
        contentType: file.type,
        directory,
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