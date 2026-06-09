const csvData = `🌸  BYSAROU — INVENTORY DASHBOARD,,,,,,,
Live overview • Updates automatically,,,,,,,
,,,,,,,
📦 Total Products,🗂 Total Stock,✅ Delivered Orders,⏳ Pending Orders,↩ Returns,💰 Revenue (MAD),📬 Cancelled,💳 COD Orders
113,287,1,3,1,0.00 MAD,1,3
,,,,,,,
🏆  Best-Selling Products (by Qty Delivered),,,,,⚠  Low Stock Products,,
Product ID,Product Name,Qty Sold,Revenue (MAD),,Product ID,Product Name,Total Stock
PRD001,High waist pants,0,0.00 MAD,,PRD001,High waist pants,4
PRD002,High waist pants,0,0.00 MAD,,PRD002,High waist pants,5`;

const allLines = csvData.split(/\r?\n/);
let headerRowIndex = -1;
for (let i = 0; i < allLines.length; i++) {
  const line = allLines[i].toLowerCase();
  if ((line.includes("sku") || line.includes("product name")) && line.includes(",")) {
    headerRowIndex = i;
    break;
  }
}

console.log("Found header at index:", headerRowIndex);
if (headerRowIndex !== -1) {
  console.log("Header row:", allLines[headerRowIndex]);
}
