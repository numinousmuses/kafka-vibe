import { generateSignedDownloadUrl } from '../../../lib/s3/server';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { key } = req.body;
        console.log("KEY IS REQUIRED", key);
        if (!key) {
            console.log("KEY IS REQUIRED");
            return res.status(400).json({ error: 'key is required' });
        }

        const signedUrl = await generateSignedDownloadUrl({ key });
        console.log("SIGNED URL", signedUrl);
        return res.status(200).json({ signedUrl });
    } catch (error) {
        console.error('Error generating signed URL for GET:', error);
        return res.status(500).json({ error: 'Failed to generate signed URL' });
    }
} 