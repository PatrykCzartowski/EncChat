import emailjs from "emailjs-com";

export default function SendPasswordResetEmail(service_id, template, privateKey, templateParams) {
    emailjs
    .send(
      service_id,
      template,
      templateParams,
      privateKey
    )
    .then(
      (result) => {
        console.log("Email sent successfully", result.text);
      },
      (error) => {
        console.log("Email failed to send", error.text);
      }
    );
}