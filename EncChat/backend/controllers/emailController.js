import logger from '../utils/logger.js';

export const getEmailServiceData = async (req, res) => {
    logger.info('received request for email service type: ', req.body.type);
    try {
        switch(req.body.type) {
            case 'verify': {
                const template = process.env.EMAILJS_VERIFY_EMAIL_TEMPLATE;
                const serviceId = process.env.EMAILJS_SERVICE_ID;
                const publicKey = process.env.EMAILJS_PUBLIC_KEY;
                logger.info('sending email service data for verification email');
                return res.json({ template, serviceId, publicKey });
            }
            case 'reset': {
                const template = process.env.EMAILJS_RESET_PASSWORD_TEMPLATE;
                const serviceId = process.env.EMAILJS_SERVICE_ID;
                const publicKey = process.env.EMAILJS_PUBLIC_KEY;
                logger.info('sending email service data for password reset email');
                return res.json({ template, serviceId, publicKey });
            }
            default:
                logger.error('Invalid request for email service data');
                return res.status(400).json({ error: 'Invalid request' });
        }
    }
    catch (error) {
        logger.error('Internal server error while fetching email service data: ', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export default getEmailServiceData;