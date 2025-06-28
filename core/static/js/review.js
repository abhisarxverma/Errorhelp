import {find, findById, secureFetch, showTopErrorMessage, showTopMessage} from "./utils.js";

const reviewForm = find("form.footer-review-box");
const reviewTextarea = findById("footer-review-textarea");
const sendButton = findById("footer-review-button");
const thankYouText = findById("footer-thankyou-text")

reviewForm.addEventListener("submit", function(event) {

    event.preventDefault();
    let message = reviewTextarea.value;

    let formData = new FormData()

    formData.append("message", message)

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
            showTopErrorMessage("Something Went Wrong.")
            console.log(data)
        }
    })
    .catch(error => {
        showTopErrorMessage("Something went wrong!");
        console.error(error);
    })

    reviewTextarea.value = "";

    return false;
});