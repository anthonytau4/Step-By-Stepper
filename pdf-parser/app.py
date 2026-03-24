from flask import Flask, jsonify, request
import io
import pdfplumber

app = Flask(__name__)


@app.get('/health')
def health():
    return jsonify({'ok': True})


@app.post('/parse')
def parse_pdf():
    uploaded = request.files.get('file')
    if uploaded is None:
        return jsonify({'error': 'No PDF file uploaded.'}), 400

    filename = str(uploaded.filename or 'upload.pdf')
    if not filename.lower().endswith('.pdf'):
        return jsonify({'error': 'Please upload a PDF file.'}), 400

    pdf_bytes = uploaded.read()
    if not pdf_bytes:
        return jsonify({'error': 'Uploaded PDF was empty.'}), 400
    if len(pdf_bytes) > 10 * 1024 * 1024:
        return jsonify({'error': 'PDF file is too large. Max 10MB.'}), 413

    text_parts = []
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text() or ''
            if page_text:
                text_parts.append(page_text)

    return jsonify({'text': '\n\n'.join(text_parts)})
