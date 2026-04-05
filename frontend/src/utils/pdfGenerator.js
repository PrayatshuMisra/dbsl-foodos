import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateReceipt = (orderData) => {
  const {
    orderId,
    customerName,
    phone,
    address,
    items, // array of { name, quantity, price, subtotal }
    itemTotal,
    deliveryFee,
    platformFee,
    gstAmount,
    discountAmount,
    grandTotal,
    paymentMethod,
    restaurantName
  } = orderData;

  const doc = new jsPDF();
  
  // -- Company Branding --
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(245, 158, 11); // Amber 500
  doc.text("FoodOS", 105, 20, { align: "center" });
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("Delights Delivered", 105, 26, { align: "center" });

  doc.setLineWidth(0.5);
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 32, 196, 32);

  // -- Receipt Title & Meta --
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(20, 20, 20);
  doc.text("ORDER RECEIPT", 14, 45);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Order ID: #${orderId || Math.floor(100000 + Math.random() * 900000)}`, 14, 52);
  doc.text(`Date & Time: ${new Date().toLocaleString()}`, 14, 58);
  
  // -- Customer Details --
  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", 130, 45);
  doc.setFont("helvetica", "normal");
  doc.text(customerName || "Valued Customer", 130, 52);
  if(phone) doc.text(phone, 130, 58);
  
  // Split address into multiple lines to fit
  const splitAddress = doc.splitTextToSize(`Deliver to: ${address || "Pickup"}`, 60);
  doc.text(splitAddress, 130, 64);

  // -- Order Items Table --
  const tableData = items.map(item => [
    item.name,
    item.quantity.toString(),
    `Rs. ${Number(item.price).toFixed(2)}`,
    `Rs. ${Number(item.subtotal).toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: 85,
    head: [["Item Name", "Qty", "Price", "Total"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [245, 158, 11], textColor: 255 },
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'right' }
    }
  });

  const finalY = doc.lastAutoTable.finalY || 85;

  // -- Billing Summary --
  doc.setFont("helvetica", "normal");
  doc.text("Item Total:", 120, finalY + 15);
  doc.text(`Rs. ${itemTotal.toFixed(2)}`, 190, finalY + 15, { align: "right" });

  doc.text("Delivery Fee:", 120, finalY + 22);
  doc.text(`Rs. ${deliveryFee.toFixed(2)}`, 190, finalY + 22, { align: "right" });

  doc.text("Platform Fee:", 120, finalY + 29);
  doc.text(`Rs. ${platformFee.toFixed(2)}`, 190, finalY + 29, { align: "right" });

  doc.text("GST (5%):", 120, finalY + 36);
  doc.text(`Rs. ${gstAmount.toFixed(2)}`, 190, finalY + 36, { align: "right" });

  if (discountAmount > 0) {
    doc.setTextColor(0, 128, 0);
    doc.text("Discount:", 120, finalY + 43);
    doc.text(`-Rs. ${discountAmount.toFixed(2)}`, 190, finalY + 43, { align: "right" });
    doc.setTextColor(20, 20, 20); // reset color
  }

  // Grand Total Line
  const totalsY = discountAmount > 0 ? finalY + 53 : finalY + 46;
  doc.setLineWidth(0.5);
  doc.line(110, totalsY - 6, 196, totalsY - 6);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("GRAND TOTAL:", 120, totalsY);
  doc.text(`Rs. ${grandTotal}`, 190, totalsY, { align: "right" });

  // Payment Method
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.text(`Paid via: ${paymentMethod || "Cash on Delivery"}`, 120, totalsY + 8);

  // -- Footer --
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150, 150, 150);
  const pageHeight = doc.internal.pageSize.height;
  doc.text("Thank you for ordering with FoodOS!", 105, pageHeight - 20, { align: "center" });
  doc.text("For any queries, contact support@foodos.com", 105, pageHeight - 14, { align: "center" });

  // Download logic
  doc.save(`FoodOS_Receipt_Order.pdf`);
};
