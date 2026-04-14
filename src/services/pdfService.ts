import { jsPDF } from "jspdf";
import JsBarcode from "jsbarcode";

export async function createColoringBookPDF(
  childName: string, 
  theme: string, 
  coverUrl: string, 
  pages: { title: string; imageUrl: string }[]
) {
  const doc = new jsPDF();
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  // Cover Page
  doc.setFontSize(32);
  doc.setTextColor(249, 115, 22); // Orange-500
  doc.text("ColorJoy AI", width / 2, height / 3, { align: "center" });
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.setFontSize(24);
  doc.text(theme, width / 2, height / 2, { align: "center" });
  doc.setFontSize(18);
  doc.text(`For ${childName}`, width / 2, height / 2 + 20, { align: "center" });

  try {
    doc.addImage(coverUrl, "PNG", 10, height / 2 + 40, width - 20, width - 20);
  } catch (e) {
    console.error("Error adding cover image", e);
  }

  // Pages
  pages.forEach((page, index) => {
    doc.addPage();
    doc.setFontSize(18);
    doc.setTextColor(30, 41, 59);
    doc.text(page.title, width / 2, 20, { align: "center" });

    try {
      doc.addImage(page.imageUrl, "PNG", 10, 30, width - 20, width - 20);
    } catch (e) {
      console.error("Error adding page image", e);
    }

    // Page Number
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.text(`Page ${index + 1} of ${pages.length}`, width / 2, height - 10, { align: "center" });
  });

  // Back Cover
  doc.addPage();
  doc.setFontSize(24);
  doc.setTextColor(249, 115, 22);
  doc.text("Thanks for Coloring!", width / 2, height / 3, { align: "center" });
  
  doc.setFontSize(14);
  doc.setTextColor(71, 85, 105); // Slate-600
  doc.text("Created with ColorJoy AI", width / 2, height / 3 + 15, { align: "center" });

  // Generate Barcode
  try {
    const canvas = document.createElement("canvas");
    const isbn = `978-${Math.floor(Math.random() * 10000000000)}`;
    JsBarcode(canvas, isbn, {
      format: "CODE128",
      width: 2,
      height: 40,
      displayValue: true,
      fontSize: 14,
      background: "#ffffff"
    });
    const barcodeData = canvas.toDataURL("image/png");
    doc.addImage(barcodeData, "PNG", width / 2 - 30, height - 60, 60, 30);
    
    doc.setFontSize(10);
    doc.text(`ISBN: ${isbn}`, width / 2, height - 25, { align: "center" });
  } catch (e) {
    console.error("Error generating barcode", e);
  }

  doc.save(`${childName}_${theme.replace(/\s+/g, '_')}_ColoringBook.pdf`);
}
