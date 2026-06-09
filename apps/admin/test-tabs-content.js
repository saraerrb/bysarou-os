async function main() {
  const gids = ['1848414344', '1390881521', '2062530685', '1773694393', '414796497', '832521489'];
  const sheetId = "17P1kkWCu2COZhQu1AlPisjcJ3h0kHBAipUi9WIDjtcQ";
  
  for (const gid of gids) {
    const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${gid}`;
    const response = await fetch(exportUrl, { cache: "no-store" });
    const text = await response.text();
    const firstLines = text.split(/\r?\n/).slice(0, 3);
    console.log(`\n--- GID ${gid} ---`);
    console.log(firstLines);
  }
}
main().catch(console.error);
