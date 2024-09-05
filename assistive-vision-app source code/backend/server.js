const express = require('express');
const axios = require('axios');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const FormData = require('form-data');

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// Segment Anything model is hosted on http://localhost:5000
// LLAMA 3 vision is hosted on http://localhost:5001

app.post('/segment', async(req, res) => {
    try {
        const { image, coordinates } = req.body;

        // Convert image URI to Base64 format or send directly if it's already Base64
        const imageData = image;

        // Prepare the form data to be sent to the segmentation model
        const formData = new FormData();
        formData.append('image', imageData);
        formData.append('coordinates', JSON.stringify([coordinates]));

        // Send the request to the local Segment Anything model
        const response = await axios.post('http://localhost:5000/v1/segment', formData, {
            headers: formData.getHeaders(),
        });

        // Assuming response from SAM contains the segmented object details
        const selectedObject = response.data;

        res.json(selectedObject);
    } catch (error) {
        console.error('Error segmenting object:', error);
        res.status(500).json({ error: 'Failed to segment object' });
    }
});

app.post('/query', async(req, res) => {
    try {
        const { prompt } = req.body;

        // Send the prompt to the locally hosted LLAMA 3 model
        const response = await axios.post('http://localhost:5001/v1/generate', {
            prompt: prompt,
        });

        res.json({ response: response.data });
    } catch (error) {
        console.error('Error querying language model:', error);
        res.status(500).json({ error: 'Failed to query language model' });
    }
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});


app.post('/segment', async(req, res) => {
    try {
        const { image, coordinates } = req.body;
        const imageData = base64ToImage(image);
        const inputPoints = [
            [coordinates.x, coordinates.y]
        ];

        const inputs = processor(imageData, inputPoints = [inputPoints], return_tensors = "pt").to(device);
        const outputs = model( ** inputs);

        const masks = processor.image_processor.post_process_masks(
            outputs.pred_masks.cpu(),
            inputs["original_sizes"].cpu(),
            inputs["reshaped_input_sizes"].cpu()
        );
        const scores = outputs.iou_scores;

        res.json({ masks, scores });
    } catch (error) {
        res.status(500).json({ error: 'Failed to segment object' });
    }
});

app.post('/query', async(req, res) => {
    try {
        const { prompt } = req.body;
        const response = await model.answer_question(image, prompt, tokenizer);
        const answer = tokenizer.decode(response, skip_special_tokens = True);
        res.json({ response: answer });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate response' });
    }
});