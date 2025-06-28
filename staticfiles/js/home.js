import {find, findAll, findById} from "./utils.js";

const homeCreateButton = findById("home-create-errorframe-button")
const exampleErrorframeButton = findById("example-errorframe-button")

homeCreateButton.addEventListener("click", function() {
    console.log("create Erroframe")
    window.location.href = "/new_errorframe";
})

exampleErrorframeButton.addEventListener("click", function() {
    window.location.href = example_error_link
})