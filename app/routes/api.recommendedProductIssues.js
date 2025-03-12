import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { cors } = await authenticate.admin(request);

  const productIssues = [
    {
      id: "0",
      title: "Too expensive",
      description: "The product was too expensive.",
    },
    { id: "1", title: "Too sheap", description: "The product was too cheap." },
    {
      id: "2",
      title: "Just Right",
      description:
        "The product was just right, but the customer is still unhappy.",
    },
  ];

  const url = new URL(request.url);
  const productId = url.searchParams.get("productId");
  var splitStr = productId.split("/");
  var idNumber = parseInt(splitStr[splitStr.length - 1], 10);

  const issue = productIssues[idNumber % productIssues.length];

  return cors(json({ productIssues: issue }));
};
