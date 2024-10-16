function exportEDI850() {
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

    let edi850 = `ISA*00*          *00*          *ZZ*SENDERID       *ZZ*RECEIVERID     *${date.replace(/-/g, '')}*1705*U*00401*000000001*0*P*~\n` +
                 `GS*PO*SENDERID*RECEIVERID*${date.replace(/-/g, '')}*1705*1*X*004010~\n` +
                 `ST*850*0001~\n` +
                 `BEG*00*NE*${poNumber}**${date}~\n` +
                 `N1*ST*${vendor}~\n` +
                 `PO1`;

    itemsArray.forEach((item, index) => {
        edi850 += `*${index + 1}*${item.quantity}*EA*${item.unitPrice}**${item.itemName}~\n`;
    });

    edi850 += `CTT*${itemsArray.length}~\n` +
               `SE*${5 + itemsArray.length}*0001~\n` +
               `GE*1*1~\n` +
               `IEA*1*000000001~`;

    const blob = new Blob([edi850], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "purchase_order_850.edi";
    link.click();

    document.getElementById('output').textContent = "EDI 850 file exported.";
}
