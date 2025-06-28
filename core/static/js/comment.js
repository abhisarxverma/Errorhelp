import {find, findAll, findById, showTopErrorMessage, showTopMessage, secureFetch} from "./utils.js";

const sharedErrorId = find("main.main").dataset.errorId

const commentsJson = JSON.parse(findById("comments").textContent)
const commentsList = find(".help-comments-list")

// console.log(commentsJson)

const commentForm = find("form.help-comment-box")
const contentInput = findById("help-comment-textarea")
const nameInput = findById("helper-name-input")

commentForm.addEventListener("submit", function(event) {
    event.preventDefault();

    let name = nameInput.value;
    let content = contentInput.value 

    if (!name) showTopErrorMessage("Please Put A Name On Your comment")
    if (!content) showTopErrorMessage("Please Put Something To Post As Comment")

    let formData = new FormData();
    formData.append("name", name)
    formData.append("content", content)
    formData.append("error_id", sharedErrorId)

    try {  
        secureFetch('/post_comment', {
            method: "POST",
            body: formData
        })
        .then(response => {
            try {
                let data = response.json();
                return data;
            } catch (error) {
                showTopErrorMessage("Something Went Wrong.")
                window.location.reload();
            }
        })
        .then(data => {
            console.log(data)
            if (data.status === "success") {
                // console.log(data)
                showTopMessage("Help Comment Posted Successfully.")
                commentsJson.unshift(data["new_comment"])
                renderComments(commentsJson)
                commentForm.reset()
            }
            else showTopErrorMessage(data.message)
        })
        .catch(error => console.error(error));
    } catch (error) {
        console.error(error)
        showTopErrorMessage("Something went wrong!")
    }

    return false;
})

function checkIfComments() {
    if (commentsJson.length <= 0) return;

    const noCommentP = document.createElement("p")
    noCommentP.textContent = "No Help Comments till now, Be the First To Help...."
    noCommentP.classList.add("no-comments-text")
    commentsList.innerHTML = ""
    commentsList.appendChild(noCommentP)
}

function getAllComments() {

    let formData = new FormData()

    formData.append("error_id", sharedErrorId)

    secureFetch("/get_comments", {
        "method" : 'POST',
        "body" : formData
    })
    .then(response => response.json())
    .then(data => {
        if (data["status"] === "failed") showTopErrorMessage(data["message"]);
        else {
            if (data["comments"].length > 0) renderComments(data["comments"])
            else console.log("No comments.")
        }
    })
    .catch(error => console.error(error))
}

function renderComments(comments) {

    commentsList.innerHTML = ""

    comments.forEach(comment => {
        const topDiv = document.createElement("div")
        topDiv.classList.add("help-comment")
        const header = document.createElement("div")
        header.classList.add("help-comment-header")
        const headerNameGroup = document.createElement("div")
        headerNameGroup.classList.add("help-comment-name-group")
        const helperTitle = document.createElement("span")
        helperTitle.classList.add("helper-title")
        helperTitle.textContent = "Helper"
        const helperNameDiv = document.createElement("div")
        helperNameDiv.classList.add("help-comment-name")
        const helperNameIcon = document.createElement("i")
        helperNameIcon.classList = "fa-regular fa-user user-icon"
        const helperNameSpan = document.createElement("span")
        helperNameSpan.textContent = comment.commentor_name
        const commentTime = document.createElement("span")
        commentTime.classList = "help-comment-time"
        commentTime.textContent = comment.comment_time
        const commentContent = document.createElement("div")
        commentContent.textContent = comment.content
        const bottomRightImage = document.createElement("img")
        bottomRightImage.classList = "comment-side-logo"
        bottomRightImage.src = fadeLogoUrl
        bottomRightImage.alt = "Fade blue logo of the Errorhelp website"
    
        topDiv.appendChild(header)
        topDiv.appendChild(commentContent)
        helperNameDiv.appendChild(helperTitle)
        helperNameDiv.appendChild(helperNameSpan)
        headerNameGroup.appendChild(helperNameIcon)
        headerNameGroup.appendChild(helperNameDiv)
        header.appendChild(headerNameGroup)
        header.appendChild(commentTime)
        topDiv.appendChild(bottomRightImage)
        commentsList.appendChild(topDiv)
    })

}   