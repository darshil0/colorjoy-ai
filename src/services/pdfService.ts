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

  doc.save(`${childName}_${theme.replace(/\s+/g, '_')}_ColoringBook.pdf`);
}
