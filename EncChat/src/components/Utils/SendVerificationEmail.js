import emailjs from "emailjs-com";

export default function SendEmailVerif(templateParams) {
    emailjs
    .send(
      "service_vwslm5v",
      "template_83c4oht",
      templateParams,
      "bQuJxmYn_RpyEwRv8"
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