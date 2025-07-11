import {find, findById, secureFetch, showTopErrorMessage, showTopMessage} from "./utils.js";

const reviewForm = find("form.footer-review-box");
const reviewTextarea = findById("footer-review-textarea");
const sendButton = findById("footer-review-button");
const thankYouText = findById("footer-thankyou-text")
const sendReviewButtonLoader = findById("send-review-button-loader")
const sendReviewButtonIcon = findById("send-review-button-icon")

reviewForm.addEventListener("submit", async function(event) {
    event.preventDefault();
    sendReviewButtonIcon.style.display = "none";
    sendReviewButtonLoader.style.display = "block";
    sendButton.disabled = true;

    let message = reviewTextarea.value;
    let formData = new FormData();
    formData.append("message", message);

    try {
        const response = await secureFetch("/send_review", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (data.status === "success") {
            showTopMessage("Review Successfully sent, Thank you very much.");
            
            setTimeout(() => {
                reviewTextarea.value = "";
            }, 100);
        } else {
            showTopErrorMessage(data["message"]);
        }
    } catch (error) {
        showTopErrorMessage("Something went wrong!");
        console.error(error);
    } finally {
        requestAnimationFrame(() => {
            sendReviewButtonIcon.style.display = "block";
            sendReviewButtonLoader.style.display = "none";
            sendButton.disabled = false;
        });
    }
});