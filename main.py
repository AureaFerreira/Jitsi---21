from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from deepface import DeepFace
import cv2
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "API pronta para análise de webcam"}

@app.get("/analyze-webcam")
def analyze_webcam():
    cap = cv2.VideoCapture(0)  # 0 é webcam padrão
    results = []
    frame_rate = cap.get(cv2.CAP_PROP_FPS)
    if frame_rate == 0:
        frame_rate = 30  # padrão se não conseguir captar FPS da webcam
    frame_count = 0

    # Vamos capturar por um tempo limitado (ex: 10 segundos)
    import time
    start_time = time.time()
    max_duration = 10  # segundos

    while (time.time() - start_time) < max_duration:
        ret, frame = cap.read()
        if not ret:
            break
        
        # Analisa 1 frame por segundo
        if frame_count % int(frame_rate) == 0:
            try:
                analysis = DeepFace.analyze(
                    frame,
                    actions=['emotion'],
                    enforce_detection=False,
                    silent=True
                )
                dominant_emotion = analysis[0].get("dominant_emotion", "")
                emotions = {k: round(float(v), 2) for k, v in analysis[0]["emotion"].items()}
                
                results.append({
                    "second": frame_count // int(frame_rate),
                    "dominant_emotion": dominant_emotion,
                    "emotions": emotions
                })
            except Exception as e:
                results.append({
                    "second": frame_count // int(frame_rate),
                    "error": f"Erro no frame: {str(e)}"
                })
        frame_count += 1

    cap.release()

    return {"analysis": results}
