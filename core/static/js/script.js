import { findById } from "./utils.js";

// const githubButton = findById("github-button");
const footerGithubText = findById("footer-github-text")
const headerTitle = findById("header-title")

// githubButton.addEventListener("click", function() {
//     window.location.href = "https://github.com/abhisarxverma/Errorhelp";
// })

footerGithubText.addEventListener("click", function() {
    window.location.href = "https://github.com/abhisarxverma/Errorhelp";
})

headerTitle.addEventListener("click", function() {
    window.location.href = "https://errorhelp.pythonanywhere.com";
})