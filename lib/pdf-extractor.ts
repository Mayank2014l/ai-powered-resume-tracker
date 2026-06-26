/**
 * Browser-side text extraction and Base64 loader for Resumes (PDF / TXT)
 */
export async function extractTextFromFile(file: File): Promise<{ text: string; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;

      // Handle TXT files directly
      if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        try {
          const textReader = new FileReader();
          textReader.onload = (txtEvent) => {
            const text = txtEvent.target?.result as string;
            resolve({ text, dataUrl });
          };
          textReader.onerror = () => reject(new Error("Failed to read text file"));
          textReader.readAsText(file);
        } catch (err) {
          reject(err);
        }
        return;
      }

      // Handle PDF files
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        try {
          // Load PDF.js from CDN if not already present
          if (!(window as any).pdfjsLib) {
            await new Promise<void>((res, rej) => {
              const script = document.createElement("script");
              script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
              script.onload = () => res();
              script.onerror = () => rej(new Error("Failed to load PDF library script from CDN."));
              document.head.appendChild(script);
            });
          }

          const pdfjs = (window as any).pdfjsLib;
          // Set worker URL
          pdfjs.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
          let text = "";

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
              .map((item: any) => item.str)
              .join(" ");
            text += pageText + "\n";
          }

          // If no text was extracted (e.g. image-based PDF or corrupted)
          if (!text.trim()) {
            reject(new Error("The PDF appears to be empty or image-based. Please upload a text-based PDF."));
            return;
          }

          resolve({ text: text.trim(), dataUrl });
        } catch (err: any) {
          console.error("PDF extraction error:", err);
          reject(new Error(`Failed to parse PDF: ${err.message || err}`));
        }
        return;
      }

      // Fallback for docx or other formats
      reject(new Error("Unsupported file type. Please upload a PDF or TXT file."));
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
