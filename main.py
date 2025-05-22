# main.py
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from deepface import DeepFace
import cv2
import json
import time
from typing import List, Dict, Any

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "API pronta para análise de expressões faciais"}

@app.get("/analyze-webcam")
def analyze_webcam():
    cap = cv2.VideoCapture(0)  # 0 é webcam padrão
    results: List[Dict[str, Any]] = []
    frame_rate = cap.get(cv2.CAP_PROP_FPS)
    
    if frame_rate == 0:
        frame_rate = 30  # padrão se não conseguir captar FPS da webcam
    
    frame_count = 0
    max_duration = 10  # segundos
    start_time = time.time()

    while (time.time() - start_time) < max_duration:
        ret, frame = cap.read()
        if not ret:
            break
        
        # Analisa 1 frame por segundo
        if frame_count % int(frame_rate) == 0:
            try:
                # Convert BGR to RGB
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                
                analysis = DeepFace.analyze(
                    rgb_frame,
                    actions=['emotion'],
                    enforce_detection=False,
                    silent=True
                )
                
                dominant_emotion = analysis[0].get("dominant_emotion", "unknown")
                emotions = {k: round(float(v), 2) for k, v in analysis[0]["emotion"].items()}
                
                results.append({
                    "second": frame_count // int(frame_rate),
                    "dominant_emotion": dominant_emotion,
                    "emotions": emotions,
                    "success": True
                })
                
            except Exception as e:
                results.append({
                    "second": frame_count // int(frame_rate),
                    "error": str(e),
                    "success": False
                })
        
        frame_count += 1

    cap.release()
    
    # Calculate most frequent emotion
    if results:
        emotions = [r["dominant_emotion"] for r in results if r.get("success")]
        if emotions:
            most_frequent = max(set(emotions), key=emotions.count)
            return {
                "status": "success",
                "analysis": results,
                "most_frequent_emotion": most_frequent,
                "duration_seconds": max_duration
            }
    
    return {
        "status": "error",
        "message": "No faces detected",
        "analysis": results,
        "duration_seconds": max_duration
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)