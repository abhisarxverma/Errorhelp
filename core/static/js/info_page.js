import {findById} from "./utils.js";

const homeButton = findById("info-page-home-button");

homeButton.addEventListener("click", function() {
    window.location.href = "/";
})