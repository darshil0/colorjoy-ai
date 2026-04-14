import { jsPDF } from "jspdf";
import JsBarcode from "jsbarcode";

function generateBarcodeDataUrl(text: string): string {
  const canvas = document.createElement("canvas");
  JsBarcode(canvas, text, {
    format: "EAN13",
    lineColor: "#000",
    width: 2,
    height: 40,
    displayValue: true,
    fontSize: 14,
    margin: 10
  });
  return canvas.toDataURL("image/png");
}

function generateRandomISBN(): string {
  const prefix = "978";
  const randomDigits = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
  const isbnWithoutCheck = prefix + randomDigits;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(isbnWithoutCheck[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return isbnWithoutCheck + checkDigit;
}

export async function createColoringBookPDF(
  childName: string,
  theme: string,
  coverImage: string,
  pages: { title: string; imageUrl: string }[]
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const totalPages = pages.length + 2;

  // --- Cover Page ---
  doc.setFillColor(250, 250, 250);
  doc.rect(0, 0, pageWidth, pageHeight, "F");
  doc.setFontSize(32);
  doc.setTextColor(40, 40, 40);
  doc.text(`${childName}'s`, pageWidth / 2, 40, { align: "center" });
  doc.setFontSize(48);
  doc.text("Coloring Book", pageWidth / 2, 65, { align: "center" });
  doc.setFontSize(18);
  doc.text(`Theme: ${theme}`, pageWidth / 2, 85, { align: "center" });

  if (coverImage) {
    const imgWidth = 160;
    const imgHeight = 160;
    const x = (pageWidth - imgWidth) / 2;
    const y = 100;
    doc.addImage(coverImage, "PNG", x, y, imgWidth, imgHeight);
  }

  doc.setFontSize(12);
  doc.text("Created with ColorJoy AI", pageWidth / 2, pageHeight - 20, { align: "center" });
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text(`Page 1 of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: "center" });

  // --- Coloring Pages ---
  pages.forEach((page, index) => {
    doc.addPage();
    const currentPageNum = index + 2;
    doc.setFontSize(24);
    doc.setTextColor(40, 40, 40);
    doc.text(page.title, pageWidth / 2, 25, { align: "center" });

    if (page.imageUrl) {
      const imgWidth = 180;
      const imgHeight = 180;
      const x = (pageWidth - imgWidth) / 2;
      const y = 40;
      doc.addImage(page.imageUrl, "PNG", x, y, imgWidth, imgHeight);
    }

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${currentPageNum} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: "center" });
  });

  // --- Back Cover ---
  doc.addPage();
  doc.setFillColor(250, 250, 250);
  doc.rect(0, 0, pageWidth, pageHeight, "F");
  doc.setFontSize(24);
  doc.setTextColor(40, 40, 40);
  doc.text("Thanks for Coloring!", pageWidth / 2, 100, { align: "center" });
  doc.setFontSize(14);
  doc.text(`This book was specially created for ${childName}.`, pageWidth / 2, 115, { align: "center" });
  doc.text(`We hope you enjoyed the ${theme} adventure!`, pageWidth / 2, 125, { align: "center" });

  const isbn = generateRandomISBN();
  const barcodeUrl = generateBarcodeDataUrl(isbn);
  const barcodeWidth = 60;
  const barcodeHeight = 30;
  doc.addImage(barcodeUrl, "PNG", (pageWidth - barcodeWidth) / 2, pageHeight - 60, barcodeWidth, barcodeHeight);
  doc.setFontSize(10);
  doc.text(`ISBN: ${isbn.slice(0,3)}-${isbn.slice(3,12)}-${isbn.slice(12)}`, pageWidth / 2, pageHeight - 25, { align: "center" });
  doc.text("© 2026 ColorJoy AI Publishing", pageWidth / 2, pageHeight - 20, { align: "center" });
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text(`Page ${totalPages} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: "center" });

  doc.save(`${childName}_Coloring_Book.pdf`);
}
