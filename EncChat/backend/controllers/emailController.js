export const getEmailServiceData = async (req, res) => {
    try {
        switch(req.body.type) {
            case 'verify': {
                const template = process.env.EMAILJS_VERIFY_EMAIL_TEMPLATE;
                const serviceId = process.env.EMAILJS_SERVICE_ID;
                const privateKey = process.env.EMAILJS_PRIVATE_KEY;
                return res.json({ template, serviceId, privateKey });
            }
            case 'reset': {
                const template = process.env.EMAILJS_RESET_PASSWORD_TEMPLATE;
                const serviceId = process.env.EMAILJS_SERVICE_ID;
                const privateKey = process.env.EMAILJS_PRIVATE_KEY;
                return res.json({ template, serviceId, privateKey });
            }
            default:
                return res.status(400).json({ error: 'Invalid request' });
        }
    }
    catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export default getEmailServiceData;