# CM3070-Computer-Science-Final-Project

# Assistive Vision App

This project is a web and mobile application designed to assist individuals with disabilities by allowing them to interact with objects in their surroundings using a camera and AI models. The application uses the following technologies:
- **Segment Anything Model (SAM)** for real-time object segmentation.
- **LLAMA 3** for natural language processing and answering questions about the segmented objects.
- **React Native** for the mobile app frontend.
- **Node.js and Express** for the backend server.

## Features
- **Object Segmentation**: Click on objects in a live video feed to segment them.
- **Interactive Learning**: Receive detailed information about segmented objects through a natural language query system.

## Installation

### Prerequisites
- Install [Node.js](https://nodejs.org/), [Python](https://www.python.org/), and [Git](https://git-scm.com/).
- Clone this repository:
  ```
  git clone https://github.com/yourusername/assistive-vision-app.git
  cd assistive-vision-app
  ```

### Frontend (React Native App)
1. Navigate to the `frontend` folder.
2. Install dependencies:
   ```
   npm install
   ```
3. Run the app:
   ```
   npm start
   ```

### Backend (Node.js and Python)
1. Navigate to the `backend` folder.
2. Install Python dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Start the SAM server:
   ```
   python sam_server.py
   ```
4. Start the LLAMA 3 server:
   ```
   python llama3_vision_server.py
   ```
5. Start the Node.js backend:
   ```
   node server.js
   ```

## Usage
- Launch the mobile app to capture a live video stream.
- Select an object from the video by clicking on it.
- Enter a query to ask for more details about the object, and the AI will respond with relevant information.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

