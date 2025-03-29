import { handleSignedUrlRequest } from '../../../lib/s3';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    return handleSignedUrlRequest(req, res);
} 