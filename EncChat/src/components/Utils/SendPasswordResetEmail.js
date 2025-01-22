import emailjs from "emailjs-com";

export default function SendPasswordResetEmail(templateParams) {
    emailjs
    .send(
      "service_vwslm5v",
      "template_s93rfsm",
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