import fitz  # PyMuPDF


def extract_text_from_pdf(file_path: str) -> str:
    doc = fitz.open(file_path)

    full_text = []

    for page in doc:
        text = page.get_text()
        full_text.append(text)

    doc.close()

    return "\n".join(full_text)