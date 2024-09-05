from flask import Flask, request, jsonify
from PIL import Image
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from transformers import BitsAndBytesConfig
import io
import base64

# Configuration for loading the model with bitsandbytes
bnb_cfg = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_compute_dtype=torch.float16,
    llm_int8_skip_modules=["mm_projector", "vision_model"],
)

# Model and tokenizer loading
model_id = "qresearch/llama-3-vision-alpha-hf"
model = AutoModelForCausalLM.from_pretrained(
    model_id,
    trust_remote_code=True,
    torch_dtype=torch.float16,
    quantization_config=bnb_cfg,
).to("cuda" if torch.cuda.is_available() else "cpu")

tokenizer = AutoTokenizer.from_pretrained(
    model_id,
    use_fast=True,
)

app = Flask(__name__)

def base64_to_image(base64_str):
    """Convert base64 string to PIL Image."""
    image_data = base64.b64decode(base64_str)
    image = Image.open(io.BytesIO(image_data)).convert("RGB")
    return image

@app.route('/v1/generate', methods=['POST'])
def generate():
    try:
        data = request.json
        image_base64 = data.get('image')
        question = data.get('prompt')

        # Convert base64 image to PIL Image
        image = base64_to_image(image_base64)

        # Use the model to generate an answer
        answer_ids = model.answer_question(image, question, tokenizer)
        answer = tokenizer.decode(answer_ids, skip_special_tokens=True)

        return jsonify({'response': answer})

    except Exception as e:
        print(f"Error during text generation: {e}")
        return jsonify({'error': 'Failed to generate response'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
