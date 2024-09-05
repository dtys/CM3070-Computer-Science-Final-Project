from flask import Flask, request, jsonify
from PIL import Image
import io
import torch
import base64
from transformers import SamModel, SamProcessor

# Load the SAM model and processor
device = "cuda" if torch.cuda.is_available() else "cpu"
model = SamModel.from_pretrained("facebook/sam-vit-huge").to(device)
processor = SamProcessor.from_pretrained("facebook/sam-vit-huge")

app = Flask(__name__)

def base64_to_image(base64_str):
    """Convert base64 string to PIL Image."""
    image_data = base64.b64decode(base64_str)
    image = Image.open(io.BytesIO(image_data)).convert("RGB")
    return image

@app.route('/v1/segment', methods=['POST'])
def segment():
    try:
        data = request.json
        image_base64 = data.get('image')
        coordinates = data.get('coordinates')

        # Convert base64 image to PIL Image
        raw_image = base64_to_image(image_base64)

        # Prepare input points (coordinates)
        input_points = [[coordinates['x'], coordinates['y']]]

        # Process the image with the SAM model
        inputs = processor(raw_image, input_points=[input_points], return_tensors="pt").to(device)

        with torch.no_grad():
            outputs = model(**inputs)

        # Post-process the masks
        masks = processor.image_processor.post_process_masks(
            outputs.pred_masks.cpu(), 
            inputs["original_sizes"].cpu(), 
            inputs["reshaped_input_sizes"].cpu()
        )
        scores = outputs.iou_scores

        # Create a response with the masks and scores
        response = {
            'masks': masks.tolist(),  # Converting masks to a serializable format
            'scores': scores.tolist()  # Converting scores to a serializable format
        }

        return jsonify(response)

    except Exception as e:
        print(f"Error during segmentation: {e}")
        return jsonify({'error': 'Failed to process the image'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
    


