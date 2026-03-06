import os
import tempfile
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Face AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_deepface = None

def get_deepface():
    global _deepface
    if _deepface is None:
        from deepface import DeepFace
        _deepface = DeepFace
    return _deepface


@app.get("/health")
async def health_check():
    return {"status": "online", "service": "Face AI Service"}


@app.post("/api/face/embedding")
async def extract_embedding(face_image: UploadFile = File(...)):
    suffix = os.path.splitext(face_image.filename or "face.jpg")[1] or ".jpg"
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        contents = await face_image.read()
        tmp.write(contents)
        tmp_path = tmp.name

    try:
        DeepFace = get_deepface()
        
        result = DeepFace.represent(
            img_path=tmp_path,
            model_name="ArcFace",
            enforce_detection=True,
            detector_backend="opencv"
        )

        if not result or len(result) == 0:
            return {
                "embedding": [],
                "face_detected": False,
                "message": "Face not detected"
            }

        embedding = result[0]["embedding"]
        
        return {
            "embedding": embedding,
            "face_detected": True,
            "message": f"Successfully extracted embedding ({len(embedding)} dim)"
        }

    except ValueError as e:
        return {
            "embedding": [],
            "face_detected": False,
            "message": f"Face not detected: {str(e)}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI processing error: {str(e)}")
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
