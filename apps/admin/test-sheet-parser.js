const Papa = require('papaparse');

async function main() {
  const url = "https://docs.google.com/spreadsheets/d/17P1kkWCu2COZhQu1AlPisjcJ3h0kHBAipUi9WIDjtcQ/edit?usp=sharing";
  
  const sheetIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  const sheetId = sheetIdMatch[1];
  
  let gids = ["0"];
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
    console.error(e);
  }

  let bestCsvData = "";
  let bestHeaderRowIndex = -1;
  let isSizeMatrix = false;

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

      if (currentScore > score) {
        score = currentScore;
        headerRowIndex = i;
        hasMatrix = hasMatrix;
      }
    }

    if (score >= 4 && headerRowIndex !== -1) {
      bestCsvData = allLines.slice(headerRowIndex).join("\n");
      bestHeaderRowIndex = headerRowIndex;
      isSizeMatrix = hasMatrix;
      console.log(`Selected GID ${gid} with score ${score}. Matrix? ${isSizeMatrix}`);
      break;
    }
  }

  const parsed = Papa.parse(bestCsvData, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });

  console.log("Parsed rows count:", parsed.data.length);
  
  const SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "XXL", "One Size"];
  let variantsCount = 0;
  
  for (const row of parsed.data) {
    const getValue = (aliases) => {
      const key = Object.keys(row).find(k => aliases.some(a => k.toLowerCase().trim() === a.toLowerCase().trim()));
      return key ? row[key] : null;
    };

    const baseSku = (getValue(["SKU", "Product ID", "Ref", "Reference", "/"]) || "").toString();
    const productName = getValue(["Product Name", "Name", "Product", "Designation"]);

    if (!baseSku || !productName) continue;

    if (isSizeMatrix) {
      for (const size of SIZES) {
        const sizeStockVal = getValue([`${size} Stock`, `Stock ${size}`, `Taille ${size}`]);
        if (sizeStockVal !== null && sizeStockVal !== undefined && sizeStockVal !== "") {
          variantsCount++;
        }
      }
    } else {
      variantsCount++;
    }
  }
  
  console.log("Expected variants to create/update:", variantsCount);
}

main().catch(console.error);
