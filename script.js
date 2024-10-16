let purchaseOrder = {};

function addItem() {
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="text" class="itemName" placeholder="Descripción del ítem"></td>
        <td><input type="number" class="quantity" placeholder="Cantidad" min="1"></td>
        <td><input type="number" class="unitPrice" placeholder="Precio Unitario" step="0.01"></td>
    `;
    document.querySelector('#itemsGrid tbody').appendChild(newRow);
}

function savePurchaseOrder() {
    const poNumber = document.getElementById('poNumber').value;
    const vendor = document.getElementById('vendor').value;
    const date = document.getElementById('date').value;
    const itemsRows = document.querySelectorAll('#itemsGrid tbody tr');

    if (!poNumber || !vendor || !date || itemsRows.length === 0) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    const itemsArray = Array.from(itemsRows).map(row => {
        const itemName = row.querySelector('.itemName').value;
        const quantity = parseInt(row.querySelector('.quantity').value, 10);
        const unitPrice = parseFloat(row.querySelector('.unitPrice').value);
        return { itemName, quantity, unitPrice };
    });

    purchaseOrder = {
        poNumber,
        vendor,
        date,
        items: itemsArray
    };

    document.getElementById('output').textContent = "Orden de compra guardada como JSON.";
}

function exportEDI850() {
    if (!purchaseOrder || Object.keys(purchaseOrder).length === 0) {
        alert("Por favor, guarda primero la orden de compra.");
        return;
    }

    let edi850 = `ISA*00*          *00*          *ZZ*SENDERID       *ZZ*RECEIVERID     *${purchaseOrder.date.replace(/-/g, '')}*1705*U*00401*000000001*0*P*~
GS*PO*SENDERID*RECEIVERID*${purchaseOrder.date.replace(/-/g, '')}*1705*1*X*004010
ST*850*0001
BEG*00*NE*${purchaseOrder.poNumber}**${purchaseOrder.date}
N1*ST*${purchaseOrder.vendor}
PO1`;

    purchaseOrder.items.forEach((item, index) => {
        edi850 += `*${index + 1}*${item.quantity}*EA*${item.unitPrice}**${item.itemName}~\n`;
    });

    edi850 += `CTT*${purchaseOrder.items.length}~\nSE*${5 + purchaseOrder.items.length}*0001~\nGE*1*1~\nIEA*1*000000001~`;

    const blob = new Blob([edi850], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "purchase_order_850.edi";
    link.click();

    document.getElementById('output').textContent = "Archivo EDI 850 exportado.";
}

function exportJSON() {
    if (!purchaseOrder || Object.keys(purchaseOrder).length === 0) {
        alert("Por favor, guarda primero la orden de compra.");
        return;
    }

    const jsonString = JSON.stringify(purchaseOrder, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "purchase_order.json";
    link.click();

    document.getElementById('output').textContent = "Orden de compra exportada como JSON.";
}

function loadJSON() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = event => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = e => {
            const loadedPurchaseOrder = JSON.parse(e.target.result);
            document.getElementById('poNumber').value = loadedPurchaseOrder.poNumber;
            document.getElementById('vendor').value = loadedPurchaseOrder.vendor;
            document.getElementById('date').value = loadedPurchaseOrder.date;

            const itemsGridBody = document.querySelector('#itemsGrid tbody');
            itemsGridBody.innerHTML = ''; // Limpiar filas anteriores

            loadedPurchaseOrder.items.forEach(item => {
                const newRow = document.createElement('tr');
                newRow.innerHTML = `
                    <td><input type="text" class="itemName" value="${item.itemName}" placeholder="Descripción del ítem"></td>
                    <td><input type="number" class="quantity" value="${item.quantity}" placeholder="Cantidad" min="1"></td>
                    <td><input type="number" class="unitPrice" value="${item.unitPrice}" placeholder="Precio Unitario" step="0.01"></td>
                `;
                itemsGridBody.appendChild(newRow);
            });
        };
        reader.readAsText(file);
    };
    input.click();
}

