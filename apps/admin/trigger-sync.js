async function main() {
  const res = await fetch("http://localhost:3000/api/integrations/google-sheets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: "https://docs.google.com/spreadsheets/d/17P1kkWCu2COZhQu1AlPisjcJ3h0kHBAipUi9WIDjtcQ/edit?usp=sharing" })
  });
  
  if (res.ok) {
    const data = await res.json();
    console.log("Success!", data);
  } else {
    console.log("Failed:", res.status, await res.text());
  }
}
main().catch(console.error);
