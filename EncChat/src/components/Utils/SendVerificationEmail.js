import emailjs from "emailjs-com";

export default function SendEmailVerif(templateParams) {
    emailjs
    .send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_VERIFY_EMAIL_TEMPLATE,
      templateParams,
      process.env.EMAILJS_PRIVATE_KEY
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