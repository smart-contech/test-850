let purchaseOrder = {};

function savePurchaseOrder() {
    const poNumber = document.getElementById('poNumber').value;
    const vendor = document.getElementById('vendor').value;
    const date = document.getElementById('date').value;
    const itemsText = document.getElementById('items').value;

    if (!poNumber || !vendor || !date || !itemsText) {
        alert("Please fill in all the fields.");
        return;
    }

    const itemsArray = itemsText.split('\n').map(item => {
        const [itemName, quantity, unitPrice] = item.split(',').map(i => i.trim());
        return {
            itemName,
            quantity: parseInt(quantity, 10),
            unitPrice: parseFloat(unitPrice)
        };
    });

    purchaseOrder = {
        poNumber,
        vendor,
        date,
        items: itemsArray
    };

    document.getElementById('output').textContent = "Purchase order saved as JSON.";
}

function exportEDI850() {
    if (!purchaseOrder || Object.keys(purchaseOrder).length === 0) {
        alert("Please save the purchase order first.");
        return;
    }

    let edi850 = `ISA*00*          *00*          *ZZ*SENDERID       *ZZ*RECEIVERID     *210726*1705*U*00401*000000001*0*P*~
GS*PO*SENDERID*RECEIVERID*${purchaseOrder.date.replace(/-/g, '')}*1705*1*X*004010
ST*850*0001
BEG*00*NE*${purchaseOrder.poNumber}**${purchaseOrder.date}
N1*ST*${purchaseOrder.vendor}
PO1`;

    purchaseOrder.items.forEach((item, index) => {
        edi850 += `*${index + 1}*${item.quantity}*EA*${item.unitPrice}**${item.itemName}~\n`;
    });

    edi850 += "CTT*" + purchaseOrder.items.length + "~\nSE*" + (5 + purchaseOrder.items.length) + "*0001~\nGE*1*1~\nIEA*1*000000001~";

    const blob = new Blob([edi850], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "purchase_order_850.edi";
    link.click();

    document.getElementById('output').textContent = "EDI 850 file exported.";
}

// Nueva función para exportar en formato JSON
function exportJSON() {
    if (!purchaseOrder || Object.keys(purchaseOrder).length === 0) {
        alert("Please save the purchase order first.");
        return;
    }

    const jsonString = JSON.stringify(purchaseOrder, null, 2); // Formatea el JSON con sangrías
    const blob = new Blob([jsonString], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "purchase_order.json"; // Nombre del archivo JSON
    link.click();

    document.getElementById('output').textContent = "Purchase order exported as JSON.";
}
