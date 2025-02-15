import emailjs from 'emailjs-com';

export default function sendEmail(serviceId, template, templateParams, privateKey) {
    emailjs
    .send(
        serviceId,
        template,
        templateParams,
        privateKey
    )
    .then(
        (result) => { console.log("Email sent successfully", result.text); },
        (error) => { console.log("Email failed to send", error); }
    )
}