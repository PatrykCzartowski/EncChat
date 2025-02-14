import emailjs from "emailjs-com";
import dotenv from "dotenv";
import logger from "../utils/logger.js";

function sendEmail(templateParams, template) {
    
    console.log(
        process.env.EMAILJS_SERVICE_ID,
        template,
        templateParams,
        process.env.EMAILJS_PRIVATE_KEY
    )

    emailjs
    .send(
        process.env.EMAILJS_SERVICE_ID,
        template,
        templateParams,
        process.env.EMAILJS_PRIVATE_KEY
    )
    .then(
        (result) => { logger.info("Email sent successfully", result.text); },
        (error) => { logger.error("Email failed to send", error.text); console.log(error) }
    )
}

export const sendEmailVerification = (templateParams) => { 
    sendEmail(templateParams, process.env.EMAILJS_VERIFY_EMAIL_TEMPLATE); 
}

export const sendPasswordReset = (templateParams) => { 
    sendEmail(templateParams, process.env.EMAILJS_RESET_PASSWORD_TEMPLATE); 
}

export default [
    sendEmailVerification,
    sendPasswordReset
]