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

    let message = reviewTextarea.value;

    let formData = new FormData()

    formData.append("message", message)

    await new Promise(resolve => setTimeout(resolve, 3000));


    secureFetch("/send_review", {
        method : "POST",
        body : formData
    })
    .then(response => {
        try{
            let data = response.json();
            return data;
        }
        catch (error) {
            console.log(response)
            showTopErrorMessage("Something Went wrong!")
        }
    })
    .then( data => {
        if ( data.status === "success" ) {
            console.log(data)
            showTopMessage("Review Successfully sent, Thank you very much.");
        }
        else {
            showTopErrorMessage("Something Went Wrong.");
            console.log(data);
        }
    })
    .catch(error => {
        showTopErrorMessage("Something went wrong!");
        console.error(error);
    })

    sendReviewButtonIcon.style.display = "block";
    sendReviewButtonLoader.style.display = "none";

    reviewTextarea.value = "";

    return false;
});