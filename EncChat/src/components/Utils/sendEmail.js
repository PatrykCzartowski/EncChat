import emailjs from 'emailjs-com';

export default function sendEmail(serviceId, template, templateParams, publicKey) {

    emailjs.init(publicKey);

    emailjs
    .send(
        serviceId,
        template,
        templateParams,
        publicKey
    )
    .then(
        (result) => { console.log("Email sent successfully", result.text); },
        (error) => { console.log("Email failed to send", error); }
    )
}