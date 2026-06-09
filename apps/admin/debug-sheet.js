const sheetId = '17P1kkWCu2COZhQu1AlPisjcJ3h0kHBAipUi9WIDjtcQ';
const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

fetch(exportUrl)
  .then(res => res.text())
  .then(text => {
    console.log("CSV CONTENT START:");
    console.log(text.split('\n').slice(0, 30).join('\n'));
    console.log("CSV CONTENT END");
  })
  .catch(err => console.error("Fetch error:", err));
