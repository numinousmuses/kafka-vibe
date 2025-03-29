import { generateSignedUploadUrl } from './server';

/**
 * API handler for generating signed upload URLs
 * This should be used in your API routes
 */
export async function handleSignedUrlRequest(req, res) {
    try {
        const { fileName, contentType, directory } = req.body;

        if (!fileName || !contentType) {
            return res.status(400).json({ error: 'fileName and contentType are required' });
        }

        const signedUrlData = await generateSignedUploadUrl({
            fileName,
            contentType,
            directory,
        });

        return res.status(200).json(signedUrlData);
    } catch (error) {
        console.error('Error generating signed URL:', error);
        return res.status(500).json({ error: 'Failed to generate signed URL' });
    }
} 