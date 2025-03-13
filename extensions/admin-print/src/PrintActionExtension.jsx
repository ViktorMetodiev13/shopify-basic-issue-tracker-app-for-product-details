import { useEffect, useState } from "react";
import {
  reactExtension,
  useApi,
  AdminPrintAction,
  BlockStack,
  Checkbox,
  Text,
} from "@shopify/ui-extensions-react/admin";

// The target used here must match the target used in the extension's toml file (./shopify.extension.toml)
const TARGET = "admin.order-details.print-action.render";

export default reactExtension(TARGET, () => <App />);

function App() {
  // The useApi hook provides access to several useful APIs like i18n and data.
  const { i18n, data } = useApi(TARGET);
  const [src, setSrc] = useState(null);

  const [printInvoice, setPrintInvoice] = useState(true);
  const [printPackingSlip, setPrintPackingSlip] = useState(false);

  useEffect(() => {
    const printTypes = [];
    if (printInvoice) {
      printTypes.push("Invoice");
    }
    if (printPackingSlip) {
      printTypes.push("Packing Slip");
    }

    if (printTypes.length) {
      const params = new URLSearchParams({
        printType: printTypes.join(","),
        orderId: data.selected[0].id,
      });

      const fullSrc = `/print?${params.toString()}`;
      setSrc(fullSrc);
    } else {
      setSrc(null);
    }
  }, [data.selected, printInvoice, printPackingSlip]);

  return (
    <AdminPrintAction src={src}>
      <BlockStack blockGap="base">
        <Text fontWeight="bold">{i18n.translate("documents")}</Text>
        <Checkbox
          name="Invoice"
          checked={printInvoice}
          onChange={(value) => {
            setPrintInvoice(value);
          }}
        >
          Invoice
        </Checkbox>
        <Checkbox
          name="Packing Slips"
          checked={printPackingSlip}
          onChange={(value) => {
            setPrintPackingSlip(value);
          }}
        >
          Packing Slips
        </Checkbox>
      </BlockStack>
    </AdminPrintAction>
  );
}
