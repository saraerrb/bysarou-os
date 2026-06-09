const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const Papa = require('papaparse');

async function main() {
  const storeId = "cmossdqih0001oz70qp3u0jsp";
  const url = "https://docs.google.com/spreadsheets/d/17P1kkWCu2COZhQu1AlPisjcJ3h0kHBAipUi9WIDjtcQ/edit?usp=sharing";
  
  const sheetId = "17P1kkWCu2COZhQu1AlPisjcJ3h0kHBAipUi9WIDjtcQ";
  const gids = ['1848414344', '1390881521', '2062530685', '1773694393', '414796497', '832521489'];

  let bestCsvData = "";
  let bestHeaderRowIndex = -1;
  let isSizeMatrix = false;
  let highestScore = -1;

  for (const gid of gids) {
    const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${gid}`;
    const response = await fetch(exportUrl, { cache: "no-store" });
    if (!response.ok) continue;

    const csvData = await response.text();
    const allLines = csvData.split(/\r?\n/);
    
    let headerRowIndex = -1;
    let score = 0;
    let hasMatrix = false;

    for (let i = 0; i < Math.min(allLines.length, 20); i++) {
      const line = allLines[i].toLowerCase();
      let currentScore = 0;
      
      if (line.includes("product name") || line.includes("designation")) currentScore += 2;
      if (line.includes("sku") || line.includes("reference") || line.includes('"/"')) currentScore += 2;
      if (line.includes("category") || line.includes("catégorie")) currentScore += 1;
      if (line.includes("color") || line.includes("couleur")) currentScore += 1;
      
      if (line.includes("xs stock") || line.includes("s stock") || line.includes("m stock")) {
        currentScore += 3;
        hasMatrix = true;
      }

      // Penalize tab lines that look like transaction/order lists or dashboards
      if (line.includes("order id") || line.includes("recent orders") || line.includes("date") || line.includes("delivered orders")) {
        currentScore -= 5;
      }

      if (currentScore > score) {
        score = currentScore;
        headerRowIndex = i;
        hasMatrix = hasMatrix;
      }
    }

    if (score >= 4 && score > highestScore && headerRowIndex !== -1) {
      highestScore = score;
      bestCsvData = allLines.slice(headerRowIndex).join("\n");
      bestHeaderRowIndex = headerRowIndex;
      isSizeMatrix = hasMatrix;
    }
  }

  const parsed = Papa.parse(bestCsvData, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });

  const rows = parsed.data;
  let createdCount = 0;
  let updatedCount = 0;

  const SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "XXL", "One Size"];

  for (const row of rows) {
    const getValue = (aliases) => {
      const key = Object.keys(row).find(k => aliases.some(a => k.toLowerCase().trim() === a.toLowerCase().trim()));
      return key ? row[key] : null;
    };

    const baseSku = (getValue(["SKU", "Product ID", "Ref", "Reference", "/"]) || "").toString();
    const productName = getValue(["Product Name", "Name", "Product", "Designation"]);
    const categoryName = getValue(["Category", "Catégorie", "Collection"]) || "General";
    const price = parseFloat(getValue(["Price", "Selling Price", "Prix", "Prix de vente", "Total"]) || 0);
    const cost = parseFloat(getValue(["Cost", "Cost Price", "Coût", "Prix d'achat"]) || 0);
    const color = (getValue(["Color", "Couleur"]) || "").toString() || null;

    if (!baseSku || !productName) continue;

    let category = await prisma.category.findFirst({
      where: { name: categoryName, storeId: storeId }
    });

    if (!category) {
      category = await prisma.category.create({
        data: { name: categoryName, storeId: storeId }
      });
    }

    let product = await prisma.product.findFirst({
      where: { name: productName, storeId: storeId }
    });

    if (!product) {
      product = await prisma.product.create({
        data: {
          name: productName,
          price: price,
          costPrice: cost,
          sellingPrice: price,
          categoryId: category.id,
          storeId: storeId,
        }
      });
    }

    const variantsToProcess = [];

    if (isSizeMatrix) {
      for (const size of SIZES) {
        const sizeStockVal = getValue([`${size} Stock`, `Stock ${size}`, `Taille ${size}`]);
        if (sizeStockVal !== null && sizeStockVal !== undefined && sizeStockVal !== "") {
          const stock = parseInt(sizeStockVal.toString() || "0");
          variantsToProcess.push({
            size,
            stock,
            sku: `${baseSku}-${size}`
          });
        }
      }
    } 
    
    if (variantsToProcess.length === 0) {
      const stock = parseInt(getValue(["Stock", "Quantity", "Qty", "Total Stock", "Quantité"]) || 0);
      const size = (getValue(["Size", "Taille"]) || "").toString() || null;
      variantsToProcess.push({ size, stock, sku: baseSku });
    }

    for (const v of variantsToProcess) {
      const existingVariant = await prisma.productVariant.findUnique({
        where: { sku: v.sku }
      });

      if (existingVariant) {
        await prisma.productVariant.update({
          where: { id: existingVariant.id },
          data: {
            size: v.size,
            color,
            stockQuantity: v.stock,
            updatedAt: new Date(),
          }
        });
        updatedCount++;
      } else {
        await prisma.productVariant.create({
          data: {
            sku: v.sku,
            size: v.size,
            color,
            stockQuantity: v.stock,
            productId: product.id,
          }
        });
        createdCount++;
      }
    }
  }

  await prisma.settings.update({
    where: { storeId: storeId },
    data: { googleSheetUrl: url }
  });

  console.log({ success: true, created: createdCount, updated: updatedCount });
}

main().catch(console.error).finally(() => prisma.$disconnect());
