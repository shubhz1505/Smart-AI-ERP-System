from fastapi.middleware.cors import CORSMiddleware
# ocr-service/app.py
from fastapi import FastAPI, UploadFile, File, Form
from pydantic import BaseModel
import re
from PIL import Image
import io
from typing import Optional

app = FastAPI(title="Document OCR Service", version="1.0.0")

app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_credentials=True, allow_methods=['*'], allow_headers=['*'])


# Try to import pytesseract, fallback to mock if not installed
try:
    import pytesseract
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False
    print("⚠️  Tesseract not installed. Using mock OCR mode.")

class OCROutput(BaseModel):
    success: bool
    documentType: str
    extractedData: dict
    confidence: float
    needsReview: bool
    rawText: str

def extract_with_mock(doc_type: str) -> dict:
    """Mock extraction for demo when Tesseract not available"""
    if doc_type == "marksheet":
        return {
            "studentName": "Sample Student",
            "rollNumber": "MITU22BTCS0166",
            "totalMarks": 850,
            "obtainedMarks": 720,
            "percentage": 84.7,
            "semester": 5
        }
    elif doc_type == "id_card":
        return {
            "studentName": "Sample Student",
            "rollNumber": "MITU22BTCS0166",
            "department": "CSE",
            "year": 3
        }
    return {}

def extract_with_tesseract(image: Image.Image, doc_type: str) -> tuple[dict, str]:
    """Real OCR extraction using Tesseract"""
    raw_text = pytesseract.image_to_string(image)

    extracted = {}

    if doc_type == "marksheet":
        # Extract roll number
        roll_match = re.search(r'[A-Z]{3,6}\d{2}[A-Z]{2,4}\d{4}', raw_text)
        if roll_match:
            extracted['rollNumber'] = roll_match.group()

        # Extract name
        name_match = re.search(r'Name[:\s]+([A-Za-z\s]+)', raw_text)
        if name_match:
            extracted['studentName'] = name_match.group(1).strip()

        # Extract percentage
        pct_match = re.search(r'(\d+\.?\d*)\s*%', raw_text)
        if pct_match:
            extracted['percentage'] = float(pct_match.group(1))

        # Extract total marks
        marks_match = re.search(r'Total[:\s]+(\d+)', raw_text, re.IGNORECASE)
        if marks_match:
            extracted['totalMarks'] = int(marks_match.group(1))

    elif doc_type == "id_card":
        roll_match = re.search(r'[A-Z]{3,6}\d{2}[A-Z]{2,4}\d{4}', raw_text)
        if roll_match:
            extracted['rollNumber'] = roll_match.group()

        name_match = re.search(r'Name[:\s]+([A-Za-z\s]+)', raw_text)
        if name_match:
            extracted['studentName'] = name_match.group(1).strip()

    return extracted, raw_text

@app.get("/health")
def health():
    return {
        "status": "running",
        "service": "ocr-service",
        "tesseractAvailable": TESSERACT_AVAILABLE
    }

@app.post("/extract/document", response_model=OCROutput)
async def extract_document(
    file: UploadFile = File(...),
    documentType: str = Form(default="marksheet")
):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents))

    if TESSERACT_AVAILABLE:
        extracted_data, raw_text = extract_with_tesseract(image, documentType)
        confidence = 0.85 if len(extracted_data) > 2 else 0.60
    else:
        extracted_data = extract_with_mock(documentType)
        raw_text = "Mock OCR - Tesseract not installed"
        confidence = 0.90

    needs_review = confidence < 0.80 or len(extracted_data) == 0

    return OCROutput(
        success=len(extracted_data) > 0,
        documentType=documentType,
        extractedData=extracted_data,
        confidence=confidence,
        needsReview=needs_review,
        rawText=raw_text[:500]
    )
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)
