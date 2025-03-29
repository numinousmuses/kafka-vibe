import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from 'crypto';

// Initialize the S3 client
const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

/**
 * Generate a signed URL for uploading a file to S3
 * 
 * @param {Object} options - Options for generating the signed URL
 * @param {string} options.fileName - Original file name
 * @param {string} options.contentType - MIME type of the file
 * @param {string} options.directory - Directory in the bucket to store the file (optional)
 * @param {number} options.expiresIn - URL expiration time in seconds (default: 3600)
 * @returns {Promise<Object>} Object containing the signed URL and the file key
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

    // Generate a unique file key to prevent overwriting files with the same name
    const fileExtension = fileName.split('.').pop();
    const randomId = crypto.randomBytes(16).toString('hex');
    const sanitizedFileName = fileName
        .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
        .toLowerCase();

    const key = `${directory}/${randomId}-${sanitizedFileName}`;

    const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });

    return {
        signedUrl,
        key,
        url: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`,
    };
}

/**
 * Generate a signed URL for downloading a file from S3
 * 
 * @param {Object} options - Options for generating the signed URL
 * @param {string} options.key - The key of the file in S3
 * @param {number} options.expiresIn - URL expiration time in seconds (default: 3600)
 * @returns {Promise<string>} The signed URL for downloading the file
 */
export async function generateSignedDownloadUrl({
    key,
    expiresIn = 3600,
}) {
    if (!key) {
        throw new Error('key is required');
    }

    const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });

    return signedUrl;
} 