import { findById } from "./utils.js";

const githubButton = findById("github-button");

githubButton.addEventListener("click", function() {
    window.location.href = "https://github.com/abhisarxverma/Errorhelp";
})