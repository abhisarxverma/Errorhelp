from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt

from django.shortcuts import get_object_or_404

from .models import SharedError, ErrorFile, Comment

from .utils import guess_language_from_filename, createFileHierarchy, debugDump, debugPrint, format_datetime, debugTextDump, send_email, is_clean_text, check_limit

import os
import json

# Create your views here.

def newError(request):
    if request.method == "POST":
        codefiles = request.FILES.getlist("files[]")
        paths = json.loads(request.POST.get("paths"))
        title = request.POST.get("title")
        description = request.POST.get("description")
        errortext = request.POST.get("errortext")
        name = request.POST.get("name")

        if not is_clean_text(title) or not is_clean_text(description) or not is_clean_text(errortext) or not is_clean_text(name):
            return JsonResponse({'status': 'failed', 'message': 'Inappropriate content detected.'}, status=400)

        if len(paths) != len(codefiles):
            return JsonResponse({"status": "failed", 'error': 'File/path mismatch'}, status=400)
        
        if not check_limit(request, "shared-errors"):
            return JsonResponse({"status":"failed", "message": "Limit reached, Try again later."}, status=403)

        error_object = SharedError.objects.create(
            title=title,
            description=description,
            error_text = errortext,
            creator_name = name
        )

        try:
            error_object.save()
        except Exception as e:
            return JsonResponse({"status" : "failed", "message" : e}, status=400)

        for file, rel_path in zip(codefiles, paths):
            # print(f"\n\nFilename - {rel_path}\n\n")

            try: 
                new_file = ErrorFile.objects.create(
                    shared_error = error_object,
                    filename = rel_path,
                    content = file.read().decode("utf-8"),
                    language = guess_language_from_filename(file.name)
                )

                new_file.save()

            except UnicodeDecodeError :
                continue

        delete_key = error_object.delete_key
        # debugPrint("Delete key : ", delete_key)
        errorframe_url = request.build_absolute_uri(f'/errorframe/{error_object.id}')
        delete_url = request.build_absolute_uri(f'/delete_errorframe/{error_object.id}?key={delete_key}')
            
        return JsonResponse({"status" : "success", "errorframe_url" : errorframe_url, "delete_url" : delete_url, "title" : error_object.title}, status=200)

    return render(request, "core/new_errorframe.html")

def showError(request, error_id):

    try:
        error_object = get_object_or_404(SharedError, id=error_id)
    except Exception as e:
        return render(request, "core/info_page.html", {
            "message" : "Errorframe does not exist or is deleted."
        })

    errorframe_url = request.build_absolute_uri(f'/errorframe/{error_object.id}')

    codefiles = error_object.files.all()

    codefiles = createFileHierarchy(codefiles)

    # debugPrint(codefiles["root_files"])

    # debugTextDump(error_object.error_text)

    comments = [comment.to_dict() for comment in error_object.comments.all().order_by("-comment_time")]

    # debugDump(codefiles)

    return render(request, "core/errorframe.html", {
        "shared_error" : error_object.to_dict(),
        "errorframe_url" : errorframe_url,
        "codefiles" : codefiles,
        "comments" : comments
    })

def saveComment(request):

    if request.method == "POST":
        error_id = request.POST.get("error_id")
        try:
            error_object = get_object_or_404(SharedError, id=error_id)
        except Exception as e:
            return render(request, "core/info_page.html", {"message" : "Errorframe does not exist or is deleted."})

        commentor_name = request.POST.get("name")
        content = request.POST.get("content")

        if not is_clean_text(commentor_name) or not is_clean_text(content):
            return JsonResponse({'status': 'failed', 'message': 'Inappropriate content detected.'}, status=400)
        
        if not check_limit(request, "comments"):
            return JsonResponse({"status":"failed", "message": "Limit reached, Try again later."}, status=403)

        new_comment = Comment.objects.create(
            name=commentor_name,
            content=content,
            shared_error = error_object
        )

        try:
            new_comment.save()
        except Exception as e:
            return JsonResponse({"status" : "failed", "message" : e, "new_comment" : "not posted"}, status=400)
        
        new_comment_data = new_comment.to_dict()
        new_comment_data["comment_time"] = format_datetime(new_comment_data["comment_time"])
        
        return JsonResponse({"status" : "success", "message" : "Comment Successfully Posted.", "new_comment" : new_comment_data}, status=200)
    

    
def getComments(request):

    if request.method == 'POST':

        error_id = request.POST.get("error_id")
        try :
            error_object = get_object_or_404(SharedError, id=error_id)
        except Exception as e :
            return JsonResponse({"status": "failed", "message" : e, "comments" : "no comments fetched"}, status=400)

        comments_list = [comment.to_dict() for comment in error_object.comments.all().order_by("-comment_time")]
        # for comment in comments_list:
        #     comment["comment_time"] = format_datetime(comment["comment_time"])

        return JsonResponse({"status": "success", "message" : "All comments fetched.", "comments" : comments_list}, status=200)
    


def deleteErrorframe(request, error_id):

    delete_key = request.GET.get("key")
    if not delete_key: return render(request, "core/info_page.html", {"message" : "Need to pass the Delete key to delete Errorframe."})

    try:
        error_object = get_object_or_404(SharedError, id=error_id)
    except Exception as e:
        return render(request, "core/info_page.html", {"message" : e})
    
    if delete_key != str(error_object.delete_key):
        # debugPrint(f"Given delete key : {delete_key}")
        # debugPrint(f"Real delete key : {error_object.delete_key}")
        return render(request, "core/info_page.html", {"message" : "Wrong Delete key."})
    
    title = error_object.title
    name = error_object.creator_name
    error_object.delete()

    return render(request, "core/info_page.html", {"message" : f"Erroframe created by {name} with title '{title}' successfully deleted."})

def home(request) :

    example_error_id = "dd576c2a-61f3-4093-858d-81ce4910fda9"

    try:
        example_error_object = get_object_or_404(SharedError, id=example_error_id)
    except Exception as e:
        return render(request, "core/home.html", {"example_error_link" : "/new_errorframe"})
    
    example_error_link = request.build_absolute_uri(f"/errorframe/{example_error_object.id}")
    
    return render(request, "core/home.html", { "example_error_link" : example_error_link})

def send_review(request):

    if request.method == "POST":

        try:
            message = request.POST.get("message")

            if not is_clean_text(message):
                return JsonResponse({'status': 'failed', 'message': 'Inappropriate content detected.'}, status=400)
            
            if not check_limit(request, "reviews"):
                return JsonResponse({"status":"failed", "message": "Limit reached, Try again later."}, status=403)

            send_email(message)

            return JsonResponse({ "status" : "success", "messge" : 'Review Send successfully.'}, status=200)

        except Exception as e:
            return JsonResponse({"status" : "failed", "message" : e}, status=400)