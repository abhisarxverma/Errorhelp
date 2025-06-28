import { findById, find, findAll, showTopMessage, showTopErrorMessage, copyToClipboard} from "./utils.js";

const mainCodeView = find(".main-view")
const fileTree = find(".file-tree")
const fileStructure = JSON.parse(findById("file-structure-data").textContent)

const downloadCodeButton = findById("download-code-button")
const expandCodeButton = findById("expand-code-button")
const shrinkCodeButton = findById("shrink-code-button")
const codeMenuButton = findById("code-menu-button")

const main = find("main.main")

const codeBox = findById("codeBox")
const sideBar = find(".sidebar")


const backdrop = findById("backdrop")

fileStructure.root_files.sort((a, b) => a.name.localeCompare(b.name));

fileStructure.folders = sortFolderStructure(fileStructure.folders)

renderRootFiles(fileStructure.root_files)
renderFileTree(fileTree, fileStructure.folders)
showFirstCodeFile()

const allFileElements = findAll(".file")

const shareLink = findById("share-link").textContent
const shareLinkIcon = findById("copy-button")

shareLinkIcon.addEventListener("click", function() {
    console.log("copy clicked")
    copyToClipboard(shareLink)
})

expandCodeButton.addEventListener("click", function(event) {
    console.log("button clicked")
    codeBox.classList.add("code-box-expanded")
    codeBox.style.zIndex = 999;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    backdrop.style.display = "block";
    shrinkCodeButton.style.display = "block";
    expandCodeButton.style.display = "none";
    shrinkCodeButton.addEventListener("click", function() {
        collapseCode()
    })
})

codeMenuButton.addEventListener("click", function() {
    codeBox.classList.toggle("menu-hidden")
})

function collapseCode() {
    codeBox.classList.remove("code-box-expanded")
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    backdrop.style.display = "none";
    expandCodeButton.style.display = "block"
    shrinkCodeButton.style.display = "none"
}

function showCode(content, language) {
    mainCodeView.innerHTML = "";
    let preElement = document.createElement("pre");
    preElement.classList = "line-numbers";
    let codeElement = document.createElement("code");
    codeElement.classList = `language-${language}`;
    if (!content) codeElement.textContent = "Code File Empty!";
    else codeElement.textContent = content;
    mainCodeView.appendChild(preElement);
    preElement.appendChild(codeElement);
    Prism.highlightElement(codeElement);
}

function showFirstCodeFile() {
    let firstCodeFile = (fileStructure.root_files.length > 0) ? fileStructure.root_files[0] : getFirstCodeFile(fileStructure.folders)
   
    if (!firstCodeFile){
        mainCodeView.innerHTML = "";
        let preElement = document.createElement("pre");
        preElement.classList = "line-numbers";
        let codeElement = document.createElement("code");
        codeElement.textContent = "No Code To Debug...."
        mainCodeView.appendChild(preElement);
        preElement.appendChild(codeElement);
        return;
    }

    showCode(firstCodeFile.obj.content, firstCodeFile.obj.language)
}

function getFirstCodeFile(structure) {
    function findFirstCodeFile(folderObj) {

        if (folderObj.files?.length) {
            return folderObj.files[0];
        }

        for (const [subfolderName, subfolderObj] of Object.entries(folderObj)) {
            if (subfolderName !== 'files') {
                return findFirstCodeFile(subfolderObj);
            }
        }
        return null;
    }

    for (const [topFolderName, folderContent] of Object.entries(structure || {})) {
        return findFirstCodeFile(folderContent);
    }

    return null
}

function renderRootFiles(root_files) {
    if (root_files.length > 0) {
        const ul = document.createElement('ul');
        ul.classList.add('file-list');

        for (let i = 0; i < root_files.length; i++) {
            let file = root_files[i]
            const li = document.createElement('li');
            const icon = document.createElement("i");
            const nameSpan = document.createElement("span");
            li.addEventListener("click", function() {
                showCode(file.obj.content, file.obj.language);
                allFileElements.forEach(element => element.classList.remove("active"));
                li.classList.add("active");
            })
            icon.classList = "fa-regular fa-file-code";
            li.appendChild(icon);
            nameSpan.textContent = file.name;
            li.appendChild(nameSpan);
            li.classList = 'file';
            ul.appendChild(li);
        }

        fileTree.appendChild(ul)
    }
}


function renderFileTree(container, structure) {
    function renderFolderContent(folderObj, folderName, depth = 0) {
        const folderDiv = document.createElement('div');
        folderDiv.className = 'folder';
        folderDiv.style.paddingLeft = `${depth * 8}px`;

        const p = document.createElement('p');
        const icon = document.createElement('i');
        const nameSpan = document.createElement('span');
        icon.classList = 'fa-regular fa-folder';
        nameSpan.textContent = folderName;
        p.className = 'folder-name';
        p.appendChild(icon);
        p.appendChild(nameSpan);
        folderDiv.appendChild(p);

        if (folderObj.files?.length) {
            const ul = document.createElement('ul');
            ul.classList.add('file-list');

            folderObj.files.forEach(file => {
                const li = document.createElement('li');
                const icon = document.createElement("i");
                const nameSpan = document.createElement("span");
                li.className = 'file';
                li.addEventListener("click", function() {
                    showCode(file.obj.content, file.obj.language);
                    allFileElements.forEach(element => element.classList.remove("active"));
                    li.classList.add("active");
                })
                icon.classList = "fa-regular fa-file-code";
                li.appendChild(icon);
                nameSpan.textContent = file.name;
                li.appendChild(nameSpan);
                ul.appendChild(li);
            });

            folderDiv.appendChild(ul);
        }

        for (const [subfolderName, subfolderObj] of Object.entries(folderObj)) {
            if (subfolderName !== 'files') {
                const subfolderDiv = renderFolderContent(subfolderObj, subfolderName, depth + 1);
                folderDiv.appendChild(subfolderDiv);
            }
        }

        return folderDiv;
    }

    for (const [topFolderName, folderContent] of Object.entries(structure || {})) {
        const rendered = renderFolderContent(folderContent, topFolderName);
        container.appendChild(rendered);
    }
}

function sortFolderStructure(folder) {
  const sortedFolder = {};

  if (Array.isArray(folder.files)) {
    sortedFolder.files = [...folder.files].sort();
  }

  for (const key of Object.keys(folder)) {
    if (key !== 'files' && typeof folder[key] === 'object') {
      sortedFolder[key] = sortFolderStructure(folder[key]);
    }
  }

  const ordered = {};

  if (sortedFolder.files) {
    ordered.files = sortedFolder.files;
  }

  Object.keys(sortedFolder)
    .filter(k => k !== 'files')
    .sort()
    .forEach(k => {
      ordered[k] = sortedFolder[k];
    });

  return ordered;
}
