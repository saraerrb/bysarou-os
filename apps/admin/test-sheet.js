async function main() {
  const url = "https://docs.google.com/spreadsheets/d/17P1kkWCu2COZhQu1AlPisjcJ3h0kHBAipUi9WIDjtcQ/edit?usp=sharing";
  const sheetIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  const sheetId = sheetIdMatch[1];
  
  const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=0`;

  const response = await fetch(exportUrl, { cache: "no-store" });
  const csvData = await response.text();
  
  const allLines = csvData.split(/\r?\n/);
  console.log(allLines.slice(0, 30));
}

main().catch(console.error);
