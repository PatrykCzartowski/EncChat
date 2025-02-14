import { sendEmailVerification, sendPasswordReset } from "../middleware/emailMiddleware.js";

export const sendVerificationEmail = async (req, res) => {
    try {
        const templateParams = req.body.templateParams;
        sendEmailVerification(templateParams);
        return;
    }
    catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export const sendPasswordResetEmail = async (req, res) => {
    try {
        const templateParams = req.body.templateParams;
        sendPasswordReset(templateParams);
        return;
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export default [
    sendVerificationEmail,
    sendPasswordResetEmail
]