import os
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from ultralytics import YOLO
from PIL import Image
import uuid

# Load the YOLO model once (global variable)
model = YOLO(r'C:\Users\B00\Desktop\yolo_api\api\cat_ear_model_after_val.pt')

@csrf_exempt
def cat_ear_detection(request):
    if request.method == 'POST':
        # Check if multiple image files were uploaded
        image_files = request.FILES.getlist('images')  # Expecting multiple files
        if not image_files:
            return JsonResponse({"error": "No images provided"}, status=400)

        temp_dir = "C:/Users/B00/Desktop/yolo_api/api/tmp/"
        os.makedirs(temp_dir, exist_ok=True)  # Ensure the temp directory exists

        try:
            is_cropped = False  # Default to False

            for image_file in image_files:
                # Save the image temporarily
                unique_filename = f"{uuid.uuid4().hex}_{image_file.name}"
                temp_image_path = os.path.join(temp_dir, unique_filename)
                image = Image.open(image_file)
                image.save(temp_image_path)

                # Run YOLO prediction
                results = model.predict(temp_image_path)

                # Check if "crop" is detected
                for result in results:
                    for class_id in result.boxes.cls:
                        class_name = result.names[int(class_id)]
                        if class_name == 'crop':
                            is_cropped = True
                            break
                    if is_cropped:
                        break  # Stop processing more results if "crop" is detected

                # Remove the temporary file
                os.remove(temp_image_path)

                if is_cropped:
                    break  # Stop processing further images if "crop" is detected

            # Return the result
            return JsonResponse({"is_cropped": is_cropped}, status=200)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=405)
