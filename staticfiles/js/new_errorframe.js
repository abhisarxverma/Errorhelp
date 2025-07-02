/* WELCOME TO THE CODE BASE OF THE ERRORHELP, HAPPY READING */

import { find, findAll, findById, show, hide, showPopup, showTopMessage, showTopErrorMessage, copyToClipboard, blackListUploads, secureFetch } from "./utils.js";

const FILE_COUNT_LIMIT = 50;

const mainForm = find("form.main")

const browseFilesButton = findById("file-uploader-label");
const filesInput = findById("file-uploader-input");
const fileDropZone = find(".file-uploader-box")
const fileUploadInputErrorSpan = findById("file-upload-input-error")

const titleInput = findById("errorTitleInput")
const titleInputErrorSpan = findById("title-input-error")

const textInput = findById("errorTextInput")
const textInputErrorSpan = findById("errortext-input-error")

const descriptionInput = findById("errorDescriptionInput")
const descriptionInputErrorSpan = findById("description-input-error")

const nameInput = findById("nameInput")
const nameInputErrorSpan = findById("name-input-error")

const submitButton = findById("submit-error-button")

let CodeFiles = [];

const filesGroupWrapper = find(".files-group-wrapper")
const uploadedFilesGroup = find(".uploaded-files-group")
const uploadedFilesList = find(".uploaded-files-list")

const submitLoader = findById("submit-loader")
const submitButtonSpan = findById("submit-button-span")

//  submitButtonSpan.style.display = "none";
// submitLoader.style.display = "block";

const successPopup = find(".success-popup")
// showPopup(successPopup)

mainForm.addEventListener("submit", function(event) {
    event.preventDefault();
    sendData();
})

// submitButton.addEventListener("click", function () {
//     console.log("Submit button clicked")
// })

fileDropZone.addEventListener('click', () => filesInput.click());

fileDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileDropZone.classList.add('file-uploader-box-hover');
});

fileDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    fileDropZone.classList.remove('file-uploader-box-hover');
    const files = e.dataTransfer.items;
    for (const item of files) {
        const entry = item.webkitGetAsEntry();
        if (entry) {
            traverseFileTree(entry);
        }
    }
    console.log("Files : ", CodeFiles);
    show(uploadedFilesGroup);
    setTimeout(() => {
        showTopMessage(`Total Files Uploaded : ${CodeFiles.length}`);
    }, 300);
});

filesInput.addEventListener('change', () => {
    let files = filesInput.files
    Array.from(files).forEach(file => handleFile(file));
    console.log('Codefiles', CodeFiles);
    show(uploadedFilesGroup);
    setTimeout(() => {
        showTopMessage(`Total Files Uploaded : ${CodeFiles.length}`);
    }, 300);
});

function readFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        console.log(e.target.result);
    };
    reader.onerror = (e) => {
        console.error(e.target.error);
    };
    reader.readAsText(file);
}

function handleFile(file) {

    const MAX_CODE_FILE_SIZE = 1048576; 

    if (file.size > MAX_CODE_FILE_SIZE) {
        console.warn(`Skipping ${file.name}: too large (${file.size} bytes)`);
        return;
    }

    const normalized = {
        file,
        relativePath: file.webkitRelativePath || file.RelativePath || file.name
    };
    let pathParts = normalized.relativePath.split("/")
    let isBlackListedUpload = pathParts.some(part =>
        blackListUploads.some(term => part.toLowerCase().includes(term))
    );
    if (!isBlackListedUpload){
        CodeFiles.push(normalized);
        renderUploadedFiles()
    }
}

// New concept from GPT
function traverseFileTree(item, path = '') {
    if (item.isFile) {
        item.file(file => {
            file.RelativePath = path + file.name;
            handleFile(file);
        });
    } else if (item.isDirectory) {
        const dirReader = item.createReader();
        const readEntries = () => {
            dirReader.readEntries(entries => {
                if (entries.length === 0) return;

                for (const entry of entries) {
                    traverseFileTree(entry, path + item.name + '/');
                }

                readEntries();
            });
        };
        readEntries();
    }
}


function renderUploadedFiles(files = CodeFiles) {
    if (files.length <= 0) hide(uploadedFilesGroup);

    uploadedFilesList.innerHTML = ""

    files.forEach(({ file, relativePath }, index) => {
        let filediv = document.createElement("div")
        filediv.classList.add("uploaded-file")
        let fileIcon = document.createElement("i")
        fileIcon.classList = "fa-solid fa-file-code uploaded-file-icon"
        let fileNameElement = document.createElement("span")
        fileNameElement.textContent = relativePath
        fileNameElement.classList = "uploaded-file-name"
        let icon = document.createElement("i")
        icon.classList = "fa-solid fa-xmark"
        icon.classList.add("uploaded-file-cross")

        icon.addEventListener("click", function () {
            removeFile(index);
            showTopMessage(`Total Files Uploaded : ${CodeFiles.length}`)
        })

        filediv.appendChild(fileIcon);
        filediv.appendChild(fileNameElement)
        filediv.appendChild(icon)
        uploadedFilesList.appendChild(filediv)
    })
}

function validateFilesCount(files) {
    let totalFiles = files.length;
    if (totalFiles > FILE_COUNT_LIMIT) return false;
    return true;
}

function sendData() {

    if (!validateFilesCount(CodeFiles)) {
        showTopErrorMessage("File count Exceeded, Please Remove some Files.");
        return;
    }

    let formData = new FormData()

    if (CodeFiles.length <= 0) {
        showFilesInputError();
        filesInput.focus();
        return;
    }

    let paths = [];

    CodeFiles.forEach(({ file, relativePath }) => {
        // console.log(file, relativePath)
        formData.append("files[]", file, relativePath);
        paths.push(relativePath)
    })

    formData.append("paths", JSON.stringify(paths))

    let errorTitle = titleInput.value
    let errorText = textInput.value
    let errorDescription = descriptionInput.value
    let name = nameInput.value

    if (!errorTitle) {
        showTitleInputError();
        return;
    }
    else if (!errorText) {
        showTextInputError();
        return;
    }
    else if (!errorDescription) {
        showDescriptionError();
        return;
    }
    else if (!name) {
        showNameError();
        return;
    }

    formData.append("title", errorTitle);
    formData.append("errortext", errorText);
    formData.append("description", errorDescription);
    formData.append("name", name)

    submitButtonSpan.style.display = "none";
    submitLoader.style.display = "block";
    submitButton.disabled = true;

    setTimeout(() => {
        try { 
            secureFetch('/new_errorframe', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                try{
                    let data = response.json();
                    return data;
                }
                catch (error) {
                    showTopErrorMessage("Something Went Wrong.")
                }
            })
            .then(data => {
                if (data.status === 'success') {
                    // window.location.href = data.errorframe_url; 
                    showSuccessPopup(data);
                    titleInput.value = ""
                    textInput.value = ""
                    descriptionInput.value = ""
                    nameInput.value = ""
                }
                else {
                    showTopErrorMessage(data.message)
                }
            })
            .catch(error => console.error('Error:', error));
        } catch (error) {
            console.log(error)
            showTopErrorMessage("Something went wrong!")
        } finally {
            submitLoader.style.display = "none";
            submitButtonSpan.style.display = "block";
            submitButton.disabled = false;
        }

    }, 0)

}

function showSuccessPopup(data) {
    let errorframe_url = data.errorframe_url
    let delete_url = data.delete_url
    let shareMessage = giveShareMessage(data)

    const popup = find("#success-popup-wrapper")
    const messageElement = findById("share-message")
    const shareLinkElement = findById("share-link-popup")
    const deleteLinkElement = findById("delete-link-popup")
    const redirectButton = findById("go-to-errorframe-button")
    const shareLinkCopyIcon = findById("share-link-copy-icon")
    const deleteLinkCopyIcon = findById("delete-link-copy-icon")
    const shareMessageCopyIcon = findById("share-message-copy-icon")
    shareMessageCopyIcon.addEventListener("click", function() {
        copyToClipboard(shareMessage)
    })
    shareLinkCopyIcon.addEventListener("click", function () {
        copyToClipboard(errorframe_url)
    })
    deleteLinkCopyIcon.addEventListener("click", function () {
        copyToClipboard(delete_url)
    })
    redirectButton.addEventListener("click", function () {
        window.location.href = errorframe_url
    })
    messageElement.textContent = shareMessage
    shareLinkElement.textContent = errorframe_url
    deleteLinkElement.textContent = delete_url

    showPopup(popup)
}

function showFilesInputError() {
    fileUploadInputErrorSpan.textContent = "Some code file is required"
}

function showTitleInputError() {
    titleInputErrorSpan.textContent = "Title is required"
}

function showTextInputError() {
    textInputErrorSpan.textContent = "Error Message is required."
}

function showDescriptionError() {
    descriptionInputErrorSpan.textContent = "Description is required."
}

function showNameError() {
    nameInputErrorSpan.textContent = "Please Enter your name"
}

function removeFile(index) {
    if (index < 0 || index > CodeFiles.length) return;
    CodeFiles.splice(index, 1);
    renderUploadedFiles();
}

function giveShareMessage(data) {
    let message = `Hey 👋, I need help in an Error I got into....\n\nPlease Come and help me here in the Errorframe where I have put the context codefiles of error.\n\n🔗 Title : ${data.title}\n\n💻 Errorframe Link : ${data.errorframe_url}\n\nErrorHelp made it possible to create a snaphot of codefiles that are causing error, so that helpers can understand and help till fixing.
`
    return message
}