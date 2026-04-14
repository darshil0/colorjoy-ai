import { jsPDF } from "jspdf";

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
  doc.text("ColorJoy AI", width / 2, height / 3, { align: "center" });
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
  for (const page of pages) {
    doc.addPage();
    doc.setFontSize(18);
    doc.text(page.title, width / 2, 20, { align: "center" });

    try {
      doc.addImage(page.imageUrl, "PNG", 10, 30, width - 20, width - 20);
    } catch (e) {
      console.error("Error adding page image", e);
    }
  }

  // Back Cover
  doc.addPage();
  doc.setFontSize(28);
  doc.setTextColor(249, 115, 22); // Orange-500
  doc.text("Thanks for Coloring!", width / 2, height / 2 - 10, { align: "center" });

  doc.setFontSize(14);
  doc.setTextColor(100);
  doc.text("Create more at ColorJoy AI", width / 2, height / 2 + 10, { align: "center" });

  // Professional touches
  doc.setFontSize(10);
  doc.text("Published by ColorJoy AI", width / 2, height - 15, { align: "center" });

  // Mock Barcode
  doc.setFont("Courier", "bold");
  doc.setFontSize(16);
  doc.text("|| |||| ||| || |||| || |||", width - 20, height - 35, { align: "right" });
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.text("ISBN: 978-1-2345-6789-0", width - 20, height - 30, { align: "right" });

  doc.save(`${childName}_${theme.replace(/\s+/g, '_')}_ColoringBook.pdf`);
}
