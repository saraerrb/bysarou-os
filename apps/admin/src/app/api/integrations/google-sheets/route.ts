import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Papa from "papaparse";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "Google Sheet URL is required" }, { status: 400 });
    }

    const { getActiveStoreId } = await import("@/lib/store-context");
    const storeId = await getActiveStoreId();
    
    if (!storeId) {
      return NextResponse.json({ error: "No store found in context" }, { status: 404 });
    }

    const sheetIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!sheetIdMatch) {
      return NextResponse.json({ error: "Invalid Google Sheet URL" }, { status: 400 });
    }

    const sheetId = sheetIdMatch[1];
    
    let gids = ["0"];
    const gidMatch = url.match(/gid=([0-9]+)/);
    
    if (gidMatch) {
      gids = [gidMatch[1]];
    } else {
      // Try to fetch HTML to find all GIDs if none specified
      try {
        const htmlRes = await fetch(`https://docs.google.com/spreadsheets/d/${sheetId}/htmlview`);
        if (htmlRes.ok) {
          const htmlText = await htmlRes.text();
          const matches = htmlText.match(/gid=\d+/g) || [];
          if (matches.length > 0) {
            gids = [...new Set(matches.map(m => m.replace("gid=", "")))];
          }
        }
      } catch (e) {
        console.error("Could not fetch HTML to find GIDs", e);
      }
    }

    let bestCsvData = "";
    let bestHeaderRowIndex = -1;
    let isSizeMatrix = false;
    let highestScore = -1;

    // Search through all found tabs for the one that looks most like an inventory
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

      // Track the tab with the highest overall score
      if (score >= 4 && score > highestScore && headerRowIndex !== -1) {
        highestScore = score;
        bestCsvData = allLines.slice(headerRowIndex).join("\n");
        bestHeaderRowIndex = headerRowIndex;
        isSizeMatrix = hasMatrix;
      }
    }

    if (bestHeaderRowIndex === -1 || !bestCsvData) {
      return NextResponse.json({ error: "Could not find a valid inventory table in the sheet. Ensure headers like 'SKU' and 'Product Name' exist." }, { status: 400 });
    }

    const parsed = Papa.parse(bestCsvData, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });

    if (parsed.errors.length > 0) {
      console.error("CSV Parsing errors:", parsed.errors);
      return NextResponse.json({ error: "Failed to parse CSV data" }, { status: 400 });
    }

    const rows = parsed.data as any[];
    let createdCount = 0;
    let updatedCount = 0;

    const SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "XXL", "One Size"];

    for (const row of rows) {
      const getValue = (aliases: string[]) => {
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

      // Ensure Category exists
      let category = await prisma.category.findFirst({
        where: { name: categoryName, storeId: storeId }
      });

      if (!category) {
        category = await prisma.category.create({
          data: { name: categoryName, storeId: storeId }
        });
      }

      // Ensure Product exists
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

      // Process variants
      const variantsToProcess = [];

      if (isSizeMatrix) {
        // Extract sizes from columns like "XS Stock", "S Stock"
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
        // Fallback to traditional parsing
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

    return NextResponse.json({ 
      success: true, 
      created: createdCount, 
      updated: updatedCount 
    });

  } catch (error: any) {
    console.error("Google Sheets Sync Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
