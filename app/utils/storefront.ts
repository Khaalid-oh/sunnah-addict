export async function storefront(query: string, variables: Record<string, unknown> = {}) {

  const response = await fetch(

    process.env.NEXT_PUBLIC_API_URL || "",

    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": process.env.NEXT_PUBLIC_ACCESS_TOKEN || "",
      },
      body: JSON.stringify({ query, variables }),
    })

    return response.json();
  } 