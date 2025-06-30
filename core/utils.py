import json
from django.utils import formats
import smtplib
from decouple import config
import re
from django.http import JsonResponse

email = config("EMAIL")
password = config("PASSWORD")

CUSTOM_PROFANE_WORDS = config("CUSTOM_PROFANITY").split(",")

BAD_WORDS = [word.strip() for word in CUSTOM_PROFANE_WORDS if word.strip()]

# default_words = profanity.get_profane_words()
# profanity.load_censor_words(list(set(default_words + custom_words)))

def guess_language_from_filename(filename: str) -> str:
    extension_map = {
        # Programming languages
        ".py": "python",
        ".js": "javascript",
        ".ts": "typescript",
        ".java": "java",
        ".c": "c",
        ".cpp": "cpp",
        ".cs": "csharp",
        ".rb": "ruby",
        ".go": "go",
        ".php": "php",
        ".swift": "swift",
        ".kt": "kotlin",
        ".rs": "rust",
        ".hs": "haskell",
        ".scala": "scala",
        ".m": "objective-c",
        ".dart": "dart",
        ".lua": "lua",
        ".sh": "bash",
        ".bat": "batch",
        ".pl": "perl",
        ".r": "r",
        ".jl": "julia",
        ".coffee": "coffeescript",
        ".jsx": "javascript",
        ".tsx" : "javascript",

        # Web/markup/config
        ".html": "html",
        ".htm": "html",
        ".css": "css",
        ".scss": "scss",
        ".less": "less",
        ".json": "json",
        ".yaml": "yaml",
        ".yml": "yaml",
        ".xml": "xml",
        ".md": "markdown",
        ".ini": "ini",
        ".toml": "toml",
        ".env": "dotenv",

        # Data
        ".csv": "csv",
        ".tsv": "tsv",
        ".sql": "sql",

        # Scripts / meta
        ".make": "makefile",
        "Makefile": "makefile",
        "Dockerfile": "docker",
        ".dockerfile": "docker",
        "requirements.txt": "requirements",
        "package.json": "json",
        ".gitignore": "git",
    }

    name = filename.lower()

    if name in extension_map:
        return extension_map[name]

    for ext, lang in extension_map.items():
        if name.endswith(ext):
            return lang

    return "plaintext"  # fallback


def createFileHierarchy(files):
    structure = {
        'root_files': [],
        'folders': {}
    }

    def insert_into_structure(current, parts, obj):
        if len(parts) == 1:
            current.setdefault('files', []).append({
                'name': parts[0],
                'obj': obj.to_dict()
            })
            return

        folder = parts[0]
        rest = parts[1:]

        folders_dict = current.setdefault(folder, {})
        insert_into_structure(folders_dict, rest, obj)

    for obj in files:
        path = obj.filename
        parts = path.strip('/').split('/')

        if len(parts) == 1:
            structure['root_files'].append({
                'name': parts[0],
                'obj': obj.to_dict()
            })
        else:
            insert_into_structure(structure['folders'], parts, obj)

    return structure

def debugPrint(data) :
    print(f"\n\n\n{data}\n\n\n")

def debugDump(data) :
    with open("debug.json", "w") as file:
        json.dump(data, file, indent=4)

def format_datetime(dt):
     return formats.date_format(dt, "F j, Y, P", use_l10n=True)

def debugTextDump(text):
    with open("debug.txt", "w") as file:
        file.write(text)

    return



def send_email(message):

    if  not message :
        return False
    else:
        try:
            with  smtplib.SMTP('smtp.gmail.com') as connection:
                connection.starttls()
                connection.login(user=email, password=password)
                connection.sendmail(from_addr=email,
                                    to_addrs="abhisarverma163@gmail.com",
                                    msg=f'Subject:Errorhelp Website User Review\n\n{message}')
        except Exception as e :
            return False

        else:
            return True
        
# Function to check if text passed has foul language and words
def is_clean_text(text):
    text = text.lower()

    for pattern in BAD_WORDS:
        pattern = pattern.strip().lower()

        if ' ' in pattern:
            if pattern in text:
                return False
        else:
            regex = re.compile(r'\b' + re.escape(pattern) + r'\b')
            if regex.search(text):
                return False

    return True
        