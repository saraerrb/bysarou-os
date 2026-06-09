async function main() {
  const url = "https://docs.google.com/spreadsheets/d/17P1kkWCu2COZhQu1AlPisjcJ3h0kHBAipUi9WIDjtcQ/htmlview";
  const res = await fetch(url);
  const text = await res.text();
  const matches = text.match(/gid=\d+/g) || [];
  console.log("Unique GIDs found:", [...new Set(matches)]);
}
main().catch(console.error);
