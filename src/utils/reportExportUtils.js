import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDateIndonesian, formatDateTimeIndonesian } from './dateUtils';

/**
 * Format currency helper
 */
const formatIDR = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val || 0);
};

/**
 * Format number with thousand separator
 */
const formatNumber = (val) => {
  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 2
  }).format(val || 0);
};

/**
 * Format ISO datetime string to human readable Indonesian date & time
 */
const formatDateTime = (isoString) => {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return isoString;
  }
};

/**
 * Get readable period label from filter preset
 */
export const getPeriodLabel = (preset, customStartDate, customEndDate) => {
  switch (preset) {
    case 'today':
      return 'Hari Ini';
    case 'yesterday':
      return 'Kemarin';
    case '7days':
      return '7 Hari Terakhir';
    case '30days':
      return '30 Hari Terakhir';
    case 'this_month':
      return 'Bulan Ini';
    case 'custom':
      return customStartDate && customEndDate
        ? `${customStartDate} s/d ${customEndDate}`
        : customStartDate
        ? `Mulai ${customStartDate}`
        : 'Rentang Kustom';
    case 'all':
    default:
      return 'Semua Periode Waktu';
  }
};

/**
 * Common PDF header and footer generator
 */
const drawPDFHeader = (doc, title, subtitle, metaItems = [], storeName = 'XCrepes POS') => {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Top header brand bar (Blibli Blue)
  doc.setFillColor(0, 96, 174); // #0060AE
  doc.rect(0, 0, pageWidth, 8, 'F');

  // Business / Store Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(0, 96, 174);
  doc.text(storeName.toUpperCase(), 36, 28);

  // Report Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(30, 41, 59);
  doc.text(title, 36, 44);

  // Subtitle / Section
  if (subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(subtitle, 36, 56);
  }

  // Right side Meta (Generated timestamp & Period)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  const printTime = new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  let rightY = 26;
  doc.text(`Waktu Cetak: ${printTime}`, pageWidth - 36, rightY, { align: 'right' });
  rightY += 12;

  metaItems.forEach(item => {
    doc.text(`${item.label}: ${item.value}`, pageWidth - 36, rightY, { align: 'right' });
    rightY += 12;
  });

  // Divider line
  const dividerY = Math.max(68, rightY + 4);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(1);
  doc.line(36, dividerY, pageWidth - 36, dividerY);
  return dividerY;
};

const setupPDFFooter = (doc, storeName = 'XCrepes POS') => {
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);

    doc.text(`Laporan Resmi Sistem Kasir ${storeName}`, 36, pageHeight - 18);
    doc.text(`Halaman ${i} dari ${pageCount}`, pageWidth - 36, pageHeight - 18, { align: 'right' });
  }
};

/* =========================================================================
   1. EXPORT: PERFORMA PRODUK & EXTRA TOPPING
   ========================================================================= */

export const buildProductPerformanceWorksheet = ({
  items = [],
  periodLabel = 'Semua Waktu',
  activeFilter = 'Semua',
  searchTerm = '',
  storeName = 'XCrepes POS',
  showProfitMetrics = true
}) => {
  const printDate = new Date().toLocaleString('id-ID');

  let totalQty = 0;
  let totalOmset = 0;
  let totalHPP = 0;
  let totalProfit = 0;

  // Pre-calculate totals
  items.forEach(item => {
    const qty = Number(item.qtySold) || 0;
    const rev = Number(item.totalCombinedRevenue ?? item.grossRevenue ?? item.totalRevenue ?? 0);
    const hpp = Number(item.totalCombinedHpp ?? item.totalHpp ?? item.totalHPP ?? 0);
    const profit = Number(item.totalCombinedNetProfit ?? item.netProfit ?? item.grossProfit ?? (rev - hpp));

    totalQty += qty;
    totalOmset += rev;
    totalHPP += hpp;
    totalProfit += profit;
  });

  const overallMargin = totalOmset > 0 ? ((totalProfit / totalOmset) * 100).toFixed(1) : 0;

  const headerTitle = showProfitMetrics
    ? `LAPORAN PERFORMA PENJUALAN PRODUK & EXTRA TOPPING - ${storeName.toUpperCase()}`
    : `LAPORAN PERFORMA PENJUALAN PRODUK - ${storeName.toUpperCase()}`;

  const kpiSection = showProfitMetrics
    ? [
        ['RINGKASAN UTAMA PENJUALAN PRODUK'],
        ['Total Omset Penjualan', totalOmset],
        ['Total Estimasi Biaya HPP Bahan', totalHPP],
        ['Total Keuntungan Laba Bersih', totalProfit],
        ['Margin Keuntungan Rata-rata', `${overallMargin}%`],
        ['Total Jumlah Produk & Topping Terjual', totalQty],
        []
      ]
    : [
        ['RINGKASAN UTAMA PENJUALAN PRODUK'],
        ['Total Omset Penjualan', totalOmset],
        ['Total Jumlah Produk & Topping Terjual', totalQty],
        []
      ];

  const tableHeaders = showProfitMetrics
    ? [
        'No',
        'Nama Menu / Topping',
        'Kategori',
        'Tipe Item',
        'Qty Terjual',
        'Harga Satuan (Rp)',
        'Topping Terpasang (Rincian)',
        'Omset Menu Dasar (Rp)',
        'Omset Topping (Rp)',
        'Total Omset Gabungan (Rp)',
        'Estimasi HPP/Porsi (Rp)',
        'Total Estimasi HPP (Rp)',
        'Laba Bersih (Rp)',
        'Margin Laba (%)'
      ]
    : [
        'No',
        'Nama Menu / Topping',
        'Kategori',
        'Tipe Item',
        'Qty Terjual',
        'Harga Satuan (Rp)',
        'Topping Terpasang (Rincian)',
        'Omset Menu Dasar (Rp)',
        'Omset Topping (Rp)',
        'Total Omset Gabungan (Rp)'
      ];

  const rows = [
    [headerTitle],
    [`Periode Waktu : ${periodLabel}`],
    [`Filter Kategori: ${activeFilter}${searchTerm ? ` | Pencarian: "${searchTerm}"` : ''}`],
    [`Waktu Unduh   : ${printDate}`],
    [],
    ...kpiSection,
    tableHeaders
  ];

  items.forEach((item, idx) => {
    const qty = Number(item.qtySold) || 0;
    const unitPrice = Number(item.basePrice ?? item.price ?? 0);
    const rev = Number(item.totalCombinedRevenue ?? item.grossRevenue ?? item.totalRevenue ?? 0);
    const menuBaseRev = Number(item.menuGrossRevenue ?? item.grossRevenue ?? 0);
    const topRev = Number(item.totalToppingRevenue ?? 0);
    const unitHpp = Number(item.unitHpp ?? item.unitHPP ?? 0);
    const totalHpp = Number(item.totalCombinedHpp ?? item.totalHpp ?? item.totalHPP ?? (unitHpp * qty));
    const profit = Number(item.totalCombinedNetProfit ?? item.netProfit ?? item.grossProfit ?? (rev - totalHpp));
    const margin = Number((item.combinedMargin ?? item.margin ?? item.profitMarginPercent ?? (rev > 0 ? (profit / rev) * 100 : 0)).toFixed(1));

    const toppingsSummaryText = Array.isArray(item.toppingsList) && item.toppingsList.length > 0
      ? item.toppingsList.map(t => `${t.name} (${t.qtySold}x)`).join(', ')
      : '-';

    if (showProfitMetrics) {
      rows.push([
        idx + 1,
        item.name || '-',
        item.categoryName || (item.type === 'TOPPING' ? 'Extra Topping' : 'Menu Utama'),
        item.type === 'TOPPING' ? 'Extra Topping' : 'Menu Utama',
        qty,
        unitPrice,
        toppingsSummaryText,
        menuBaseRev,
        topRev,
        rev,
        unitHpp,
        totalHpp,
        profit,
        margin
      ]);
    } else {
      rows.push([
        idx + 1,
        item.name || '-',
        item.categoryName || (item.type === 'TOPPING' ? 'Extra Topping' : 'Menu Utama'),
        item.type === 'TOPPING' ? 'Extra Topping' : 'Menu Utama',
        qty,
        unitPrice,
        toppingsSummaryText,
        menuBaseRev,
        topRev,
        rev
      ]);
    }
  });

  // Summary Row
  rows.push([]);
  if (showProfitMetrics) {
    rows.push([
      'TOTAL',
      `Total ${items.length} Item Terdaftar`,
      '-',
      '-',
      totalQty,
      '-',
      '-',
      '-',
      '-',
      totalOmset,
      '-',
      totalHPP,
      totalProfit,
      Number(overallMargin)
    ]);
  } else {
    rows.push([
      'TOTAL',
      `Total ${items.length} Item Terdaftar`,
      '-',
      '-',
      totalQty,
      '-',
      '-',
      '-',
      '-',
      totalOmset
    ]);
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);

  ws['!cols'] = showProfitMetrics ? [
    { wch: 6 },  // No
    { wch: 30 }, // Nama
    { wch: 18 }, // Kategori
    { wch: 16 }, // Tipe
    { wch: 12 }, // Qty
    { wch: 18 }, // Harga Satuan
    { wch: 26 }, // Topping
    { wch: 18 }, // Omset Menu
    { wch: 18 }, // Omset Top
    { wch: 20 }, // Total Omset
    { wch: 20 }, // HPP/Porsi
    { wch: 20 }, // Total HPP
    { wch: 20 }, // Laba Bersih
    { wch: 16 }  // Margin %
  ] : [
    { wch: 6 },  // No
    { wch: 30 }, // Nama
    { wch: 18 }, // Kategori
    { wch: 16 }, // Tipe
    { wch: 12 }, // Qty
    { wch: 18 }, // Harga Satuan
    { wch: 26 }, // Topping
    { wch: 18 }, // Omset Menu
    { wch: 18 }, // Omset Top
    { wch: 20 }  // Total Omset
  ];

  return ws;
};

export const exportProductPerformanceToExcel = (params) => {
  const ws = buildProductPerformanceWorksheet(params || {});
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Summary Menu & Topping');

  const filename = `Laporan_Summary_Menu_Topping_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
};

export const exportProductPerformanceToPDF = ({
  items = [],
  periodLabel = 'Semua Waktu',
  activeFilter = 'Semua',
  searchTerm = '',
  storeName = 'XCrepes POS',
  showProfitMetrics = true
}) => {
  // A4 Landscape for comprehensive width
  const doc = new jsPDF('landscape', 'pt', 'a4');

  const reportTitle = showProfitMetrics
    ? 'Laporan Penjualan & Laba HPP'
    : 'Laporan Penjualan Produk';

  drawPDFHeader(
    doc,
    reportTitle,
    'Sub-Laporan: Performa Penjualan Produk & Extra Topping',
    [
      { label: 'Periode', value: periodLabel },
      { label: 'Filter', value: `${activeFilter}${searchTerm ? ` ("${searchTerm}")` : ''}` }
    ],
    storeName
  );

  let totalQty = 0;
  let totalOmset = 0;
  let totalHPP = 0;
  let totalProfit = 0;

  const tableBody = items.map((item, idx) => {
    const qty = Number(item.qtySold) || 0;
    const unitPrice = Number(item.basePrice ?? item.price ?? 0);
    const rev = Number(item.totalCombinedRevenue ?? item.grossRevenue ?? item.totalRevenue ?? 0);
    const unitHpp = Number(item.unitHpp ?? item.unitHPP ?? 0);
    const totalHpp = Number(item.totalCombinedHpp ?? item.totalHpp ?? item.totalHPP ?? (unitHpp * qty));
    const profit = Number(item.totalCombinedNetProfit ?? item.netProfit ?? item.grossProfit ?? (rev - totalHpp));
    const margin = Number((item.combinedMargin ?? item.margin ?? item.profitMarginPercent ?? (rev > 0 ? (profit / rev) * 100 : 0)).toFixed(1));

    totalQty += qty;
    totalOmset += rev;
    totalHPP += totalHpp;
    totalProfit += profit;

    const toppingsSummaryText = Array.isArray(item.toppingsList) && item.toppingsList.length > 0
      ? `\n+ Topping: ${item.toppingsList.map(t => `${t.name} (${t.qtySold}x)`).join(', ')}`
      : '';

    if (showProfitMetrics) {
      return [
        (idx + 1).toString(),
        `${item.name || '-'}${toppingsSummaryText}`,
        item.categoryName || (item.type === 'TOPPING' ? 'Topping' : 'Menu'),
        item.type === 'TOPPING' ? 'Topping' : 'Menu Utama',
        formatNumber(qty),
        formatIDR(unitPrice),
        formatIDR(rev),
        formatIDR(unitHpp),
        formatIDR(totalHpp),
        formatIDR(profit),
        `${margin}%`
      ];
    } else {
      return [
        (idx + 1).toString(),
        `${item.name || '-'}${toppingsSummaryText}`,
        item.categoryName || (item.type === 'TOPPING' ? 'Topping' : 'Menu'),
        item.type === 'TOPPING' ? 'Topping' : 'Menu Utama',
        formatNumber(qty),
        formatIDR(unitPrice),
        formatIDR(rev)
      ];
    }
  });

  const overallMargin = totalOmset > 0 ? ((totalProfit / totalOmset) * 100).toFixed(1) : 0;

  const tableFoot = showProfitMetrics ? [
    [
      'TOTAL',
      `Ringkasan (${items.length} Item)`,
      '-',
      '-',
      formatNumber(totalQty),
      '-',
      formatIDR(totalOmset),
      '-',
      formatIDR(totalHPP),
      formatIDR(totalProfit),
      `${overallMargin}%`
    ]
  ] : [
    [
      'TOTAL',
      `Ringkasan (${items.length} Item)`,
      '-',
      '-',
      formatNumber(totalQty),
      '-',
      formatIDR(totalOmset)
    ]
  ];

  const headCols = showProfitMetrics ? [[
    'No',
    'Nama Menu / Topping',
    'Kategori',
    'Tipe',
    'Terjual',
    'Harga Jual',
    'Total Omset',
    'HPP/Porsi',
    'Total HPP',
    'Laba Bersih',
    'Margin'
  ]] : [[
    'No',
    'Nama Menu / Topping',
    'Kategori',
    'Tipe',
    'Terjual',
    'Harga Jual',
    'Total Omset'
  ]];

  const colStyles = showProfitMetrics ? {
    0: { halign: 'center', cellWidth: 24 },
    1: { halign: 'left', fontStyle: 'bold' },
    2: { halign: 'left', cellWidth: 70 },
    3: { halign: 'center', cellWidth: 62 },
    4: { halign: 'right', cellWidth: 44 },
    5: { halign: 'right', cellWidth: 64 },
    6: { halign: 'right', cellWidth: 72 },
    7: { halign: 'right', cellWidth: 64 },
    8: { halign: 'right', cellWidth: 72 },
    9: { halign: 'right', cellWidth: 72 },
    10: { halign: 'right', cellWidth: 46 }
  } : {
    0: { halign: 'center', cellWidth: 30 },
    1: { halign: 'left', fontStyle: 'bold' },
    2: { halign: 'left', cellWidth: 100 },
    3: { halign: 'center', cellWidth: 90 },
    4: { halign: 'right', cellWidth: 70 },
    5: { halign: 'right', cellWidth: 90 },
    6: { halign: 'right', cellWidth: 100 }
  };

  autoTable(doc, {
    startY: 78,
    head: headCols,
    body: tableBody,
    foot: tableFoot,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 4.5,
      textColor: [30, 41, 59],
      valign: 'middle'
    },
    headStyles: {
      fillColor: [0, 96, 174],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: colStyles,
    margin: { left: 36, right: 36 }
  });

  setupPDFFooter(doc, storeName);

  const filename = `Laporan_Performa_Produk_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
};

/* =========================================================================
   2. EXPORT: RIWAYAT TRANSAKSI PENJUALAN
   ========================================================================= */

export const buildTransactionHistoryWorksheet = ({
  orders = [],
  periodLabel = 'Semua Waktu',
  activePaymentFilter = 'Semua',
  searchTerm = '',
  storeName = 'XCrepes POS',
  showProfitMetrics = true
}) => {
  const printDate = new Date().toLocaleString('id-ID');

  let totalRevenue = 0;
  let totalHPP = 0;
  let totalProfit = 0;

  orders.forEach(order => {
    const totalAmount = Number(order.totalAmount ?? order.grossRevenue ?? 0);
    const orderHPP = Number(order.orderTotalHPP ?? order.orderEstimatedHPP ?? 0);
    const orderProfit = Number(order.netProfit ?? order.orderGrossProfit ?? (totalAmount - orderHPP));

    totalRevenue += totalAmount;
    totalHPP += orderHPP;
    totalProfit += orderProfit;
  });

  const overallMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0;

  const kpiSection = showProfitMetrics
    ? [
        ['RINGKASAN AUDIT PENJUALAN KASIR'],
        ['Total Omset Kasir', totalRevenue],
        ['Total Estimasi Biaya HPP', totalHPP],
        ['Total Keuntungan Bersih', totalProfit],
        ['Rata-rata Margin', `${overallMargin}%`],
        ['Total Transaksi Selesai', orders.length],
        []
      ]
    : [
        ['RINGKASAN AUDIT PENJUALAN KASIR'],
        ['Total Omset Kasir', totalRevenue],
        ['Total Transaksi Selesai', orders.length],
        []
      ];

  const tableHeaders = showProfitMetrics
    ? [
        'No',
        'No. Invoice',
        'Tanggal & Waktu',
        'Nama Kasir',
        'Nama Pelanggan',
        'Meja / Tipe',
        'Metode Bayar',
        'Rincian Pesanan (Menu & Topping)',
        'Total Item',
        'Total Omset (Rp)',
        'Total Estimasi HPP (Rp)',
        'Estimasi Laba Bersih (Rp)',
        'Margin (%)'
      ]
    : [
        'No',
        'No. Invoice',
        'Tanggal & Waktu',
        'Nama Kasir',
        'Nama Pelanggan',
        'Meja / Tipe',
        'Metode Bayar',
        'Rincian Pesanan (Menu & Topping)',
        'Total Item',
        'Total Omset (Rp)'
      ];

  const rows = [
    [`LAPORAN RIWAYAT TRANSAKSI PENJUALAN - ${storeName.toUpperCase()}`],
    [`Periode Waktu  : ${periodLabel}`],
    [`Filter Metode  : ${activePaymentFilter}${searchTerm ? ` | Pencarian: "${searchTerm}"` : ''}`],
    [`Waktu Unduh    : ${printDate}`],
    [],
    ...kpiSection,
    tableHeaders
  ];

  orders.forEach((order, idx) => {
    const totalAmount = Number(order.totalAmount ?? order.grossRevenue ?? 0);
    const orderHPP = Number(order.orderTotalHPP ?? order.orderEstimatedHPP ?? 0);
    const orderProfit = Number(order.netProfit ?? order.orderGrossProfit ?? (totalAmount - orderHPP));
    const margin = Number(totalAmount > 0 ? ((orderProfit / totalAmount) * 100).toFixed(1) : 0);

    const itemsSummary = (order.items || []).map(it => {
      let line = `${it.menuName || it.name || 'Menu'} (${it.quantity || 1}x)`;
      const topList = Array.isArray(it.toppings) ? it.toppings : Array.isArray(it.selectedToppings) ? it.selectedToppings : [];
      if (topList.length > 0) {
        const topNames = topList.map(t => `${t.name}${Number(it.quantity) > 1 ? ` [${it.quantity}x]` : ''}`).join(', ');
        line += ` [+${topNames}]`;
      }
      return line;
    }).join('; ');

    const paymentLabel = order.paymentMethod === 'cash' 
      ? 'Tunai (Cash)' 
      : order.paymentMethod === 'qris' 
      ? 'QRIS' 
      : order.paymentMethod === 'card' 
      ? 'Kartu' 
      : (order.paymentMethod || 'Lainnya');

    const invoiceDisplay = order.invoiceNumber 
      ? `${order.invoiceNumber}${order.status === 'cancelled' ? ' [DIBATALKAN]' : order.status === 'returned' ? ' [DIRETUR]' : ''}`
      : '-';

    if (showProfitMetrics) {
      rows.push([
        idx + 1,
        invoiceDisplay,
        formatDateTime(order.date || order.createdAt),
        order.cashierName || 'Kasir',
        order.customerName || 'Pelanggan Umum',
        order.tableNumber || 'Takeaway',
        paymentLabel,
        itemsSummary || '-',
        Number(order.totalItemsCount) || (order.items || []).reduce((s, it) => s + (Number(it.quantity) || 1), 0),
        totalAmount,
        orderHPP,
        orderProfit,
        margin
      ]);
    } else {
      rows.push([
        idx + 1,
        invoiceDisplay,
        formatDateTime(order.date || order.createdAt),
        order.cashierName || 'Kasir',
        order.customerName || 'Pelanggan Umum',
        order.tableNumber || 'Takeaway',
        paymentLabel,
        itemsSummary || '-',
        Number(order.totalItemsCount) || (order.items || []).reduce((s, it) => s + (Number(it.quantity) || 1), 0),
        totalAmount
      ]);
    }
  });

  // Summary row
  rows.push([]);
  if (showProfitMetrics) {
    rows.push([
      'TOTAL',
      `Total ${orders.length} Transaksi`,
      '-',
      '-',
      '-',
      '-',
      '-',
      '-',
      '-',
      totalRevenue,
      totalHPP,
      totalProfit,
      Number(overallMargin)
    ]);
  } else {
    rows.push([
      'TOTAL',
      `Total ${orders.length} Transaksi`,
      '-',
      '-',
      '-',
      '-',
      '-',
      '-',
      '-',
      totalRevenue
    ]);
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);

  ws['!cols'] = showProfitMetrics ? [
    { wch: 6 },  // No
    { wch: 18 }, // Invoice
    { wch: 20 }, // Tanggal
    { wch: 14 }, // Kasir
    { wch: 20 }, // Pelanggan
    { wch: 14 }, // Meja
    { wch: 16 }, // Metode
    { wch: 45 }, // Rincian
    { wch: 12 }, // Total Item
    { wch: 18 }, // Total Omset
    { wch: 20 }, // HPP
    { wch: 20 }, // Laba
    { wch: 14 }  // Margin %
  ] : [
    { wch: 6 },  // No
    { wch: 18 }, // Invoice
    { wch: 20 }, // Tanggal
    { wch: 14 }, // Kasir
    { wch: 20 }, // Pelanggan
    { wch: 14 }, // Meja
    { wch: 16 }, // Metode
    { wch: 45 }, // Rincian
    { wch: 12 }, // Total Item
    { wch: 18 }  // Total Omset
  ];

  return ws;
};

export const exportTransactionHistoryToExcel = (params) => {
  const ws = buildTransactionHistoryWorksheet(params || {});
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Riwayat Transaksi');

  const filename = `Laporan_Transaksi_Penjualan_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
};

export const exportCompleteSalesReportToExcel = ({
  items = [],
  orders = [],
  periodLabel = 'Semua Waktu',
  activeFilter = 'Ringkasan Menu & Topping',
  activePaymentFilter = 'Semua Pembayaran',
  storeName = 'XCrepes POS',
  showProfitMetrics = true
}) => {
  const wsProducts = buildProductPerformanceWorksheet({
    items,
    periodLabel,
    activeFilter,
    searchTerm: '',
    storeName,
    showProfitMetrics
  });

  const wsTransactions = buildTransactionHistoryWorksheet({
    orders,
    periodLabel,
    activePaymentFilter,
    searchTerm: '',
    storeName,
    showProfitMetrics
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsProducts, 'Summary Menu & Topping');
  XLSX.utils.book_append_sheet(wb, wsTransactions, 'Riwayat Transaksi');

  const filename = `Laporan_Penjualan_Lengkap_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
};

export const exportTransactionHistoryToPDF = ({
  orders = [],
  periodLabel = 'Semua Waktu',
  activePaymentFilter = 'Semua',
  searchTerm = '',
  storeName = 'XCrepes POS',
  showProfitMetrics = true
}) => {
  // A4 Landscape
  const doc = new jsPDF('landscape', 'pt', 'a4');

  const reportTitle = showProfitMetrics
    ? 'Laporan Penjualan & Laba HPP'
    : 'Laporan Riwayat Transaksi Penjualan';

  drawPDFHeader(
    doc,
    reportTitle,
    'Sub-Laporan: Audit Riwayat Transaksi Penjualan Kasir',
    [
      { label: 'Periode', value: periodLabel },
      { label: 'Filter Pembayaran', value: `${activePaymentFilter}${searchTerm ? ` ("${searchTerm}")` : ''}` }
    ],
    storeName
  );

  let totalRevenue = 0;
  let totalHPP = 0;
  let totalProfit = 0;

  const tableBody = orders.map((order, idx) => {
    const totalAmount = Number(order.totalAmount ?? order.grossRevenue ?? 0);
    const orderHPP = Number(order.orderTotalHPP ?? order.orderEstimatedHPP ?? 0);
    const orderProfit = Number(order.netProfit ?? order.orderGrossProfit ?? (totalAmount - orderHPP));

    totalRevenue += totalAmount;
    totalHPP += orderHPP;
    totalProfit += orderProfit;

    const itemsSummary = (order.items || []).map(it => {
      let line = `${it.menuName || it.name || 'Menu'} (x${it.quantity || 1})`;
      const topList = Array.isArray(it.toppings) ? it.toppings : Array.isArray(it.selectedToppings) ? it.selectedToppings : [];
      if (topList.length > 0) {
        const topNames = topList.map(t => `${t.name}${Number(it.quantity) > 1 ? ` [${it.quantity}x]` : ''}`).join(', ');
        line += `\n(+${topNames})`;
      }
      return line;
    }).join('\n');

    const paymentLabel = order.paymentMethod === 'cash' 
      ? 'Tunai' 
      : order.paymentMethod === 'qris' 
      ? 'QRIS' 
      : order.paymentMethod === 'card' 
      ? 'Kartu' 
      : (order.paymentMethod || '-');

    const customerDisplay = `${order.customerName || 'Pelanggan Umum'}${order.tableNumber && order.tableNumber !== 'Takeaway' ? ` (${order.tableNumber})` : ''}`;

    const invoiceDisplay = order.invoiceNumber 
      ? `${order.invoiceNumber}${order.status === 'cancelled' ? ' [DIBATALKAN]' : order.status === 'returned' ? ' [DIRETUR]' : ''}`
      : '-';

    if (showProfitMetrics) {
      return [
        (idx + 1).toString(),
        invoiceDisplay,
        formatDateTime(order.date || order.createdAt),
        customerDisplay,
        paymentLabel,
        itemsSummary || '-',
        formatIDR(totalAmount),
        formatIDR(orderHPP),
        formatIDR(orderProfit)
      ];
    } else {
      return [
        (idx + 1).toString(),
        invoiceDisplay,
        formatDateTime(order.date || order.createdAt),
        customerDisplay,
        paymentLabel,
        itemsSummary || '-',
        formatIDR(totalAmount)
      ];
    }
  });

  const tableFoot = showProfitMetrics ? [
    [
      'TOTAL',
      `Ringkasan (${orders.length} Transaksi)`,
      '-',
      '-',
      '-',
      '-',
      formatIDR(totalRevenue),
      formatIDR(totalHPP),
      formatIDR(totalProfit)
    ]
  ] : [
    [
      'TOTAL',
      `Ringkasan (${orders.length} Transaksi)`,
      '-',
      '-',
      '-',
      '-',
      formatIDR(totalRevenue)
    ]
  ];

  const headCols = showProfitMetrics ? [[
    'No',
    'No. Invoice',
    'Waktu Transaksi',
    'Pelanggan & Meja',
    'Metode',
    'Rincian Menu & Topping',
    'Total Omset',
    'Estimasi HPP',
    'Laba Bersih'
  ]] : [[
    'No',
    'No. Invoice',
    'Waktu Transaksi',
    'Pelanggan & Meja',
    'Metode',
    'Rincian Menu & Topping',
    'Total Omset'
  ]];

  const colStyles = showProfitMetrics ? {
    0: { halign: 'center', cellWidth: 24 },
    1: { halign: 'left', fontStyle: 'bold', cellWidth: 70 },
    2: { halign: 'left', cellWidth: 64 },
    3: { halign: 'left', cellWidth: 70 },
    4: { halign: 'center', cellWidth: 44 },
    5: { halign: 'left' },
    6: { halign: 'right', cellWidth: 64 },
    7: { halign: 'right', cellWidth: 64 },
    8: { halign: 'right', cellWidth: 64 }
  } : {
    0: { halign: 'center', cellWidth: 28 },
    1: { halign: 'left', fontStyle: 'bold', cellWidth: 90 },
    2: { halign: 'left', cellWidth: 80 },
    3: { halign: 'left', cellWidth: 90 },
    4: { halign: 'center', cellWidth: 60 },
    5: { halign: 'left' },
    6: { halign: 'right', cellWidth: 90 }
  };

  autoTable(doc, {
    startY: 78,
    head: headCols,
    body: tableBody,
    foot: tableFoot,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 5,
      textColor: [30, 41, 59],
      valign: 'top'
    },
    headStyles: {
      fillColor: [0, 96, 174],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: colStyles,
    margin: { left: 36, right: 36 }
  });

  setupPDFFooter(doc, storeName);

  const filename = `Laporan_Transaksi_Penjualan_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
};

/* =========================================================================
   3. EXPORT: LAPORAN PENGURANGAN BAHAN BAKU
   ========================================================================= */

export const exportMaterialUsageToExcel = ({
  logs = [],
  periodLabel = 'Semua Waktu',
  activeMaterial = 'Semua Bahan Baku',
  activeEventType = 'Semua Penyebab',
  searchTerm = '',
  storeName = 'XCrepes POS'
}) => {
  const printDate = new Date().toLocaleString('id-ID');

  let totalDeductionQty = 0;
  let totalDeductionCost = 0;

  logs.forEach(log => {
    const qty = Number(log.amount ?? log.quantityDeducted ?? 0);
    const cost = Number(log.totalEstimatedValue ?? 0);
    totalDeductionQty += qty;
    totalDeductionCost += cost;
  });

  const rows = [
    [`LAPORAN AUDIT PENGURANGAN BAHAN BAKU - ${storeName.toUpperCase()}`],
    [`Periode Waktu  : ${periodLabel}`],
    [`Filter Bahan   : ${activeMaterial}`],
    [`Filter Penyebab: ${activeEventType}${searchTerm ? ` | Pencarian: "${searchTerm}"` : ''}`],
    [`Waktu Unduh    : ${printDate}`],
    [],
    ['RINGKASAN AUDIT MUTASI PENGURANGAN'],
    ['Total Catatan Mutasi', logs.length],
    ['Total Biaya Estimasi Nilai Bahan', totalDeductionCost],
    [],
    [
      'No',
      'Tanggal & Waktu',
      'Nama Bahan Baku',
      'Satuan',
      'Penyebab / Tipe Mutasi',
      'Stok Awal',
      'Jumlah Pengurangan',
      'Sisa Stok (Akhir)',
      'Digunakan Ke (Menu / Topping)',
      'No. Invoice / Referensi',
      'Pelanggan',
      'Dicatat Oleh',
      'Estimasi Nilai Biaya (Rp)'
    ]
  ];

  logs.forEach((log, idx) => {
    const eventName = log.eventBadgeText || (
      log.eventType === 'SALE' ? 'Penjualan Kasir POS' :
      log.eventType === 'MANUAL_OUT' ? 'Dapur / Manual' :
      log.eventType === 'ADJUST' ? 'Penyesuaian Opname' :
      log.eventType === 'WASTE' ? 'Bahan Rusak (Waste)' :
      (log.type === 'OUT' ? 'Pemakaian Stok' : 'Penyesuaian')
    );

    const qty = Number(log.amount ?? log.quantityDeducted ?? 0);
    const cost = Number(log.totalEstimatedValue ?? 0);
    const prevStock = Number(log.previousStock ?? 0);
    const curStock = Number(log.currentStock ?? log.remainingStock ?? 0);

    let destination = '-';
    if (log.sourceMenu) {
      destination = log.sourceMenu;
      if (log.toppingName) {
        destination += ` (Topping: ${log.toppingName})`;
      }
    }

    rows.push([
      idx + 1,
      formatDateTime(log.createdAt),
      log.rawMaterialName || '-',
      log.unitName || '-',
      eventName,
      prevStock,
      qty,
      curStock,
      destination,
      log.referenceInvoice || log.note || '-',
      log.customerName || '-',
      log.user || 'Sistem',
      cost
    ]);
  });

  // Summary Row
  rows.push([]);
  rows.push([
    'TOTAL',
    `Total ${logs.length} Mutasi`,
    '-',
    '-',
    '-',
    '-',
    totalDeductionQty,
    '-',
    '-',
    '-',
    '-',
    '-',
    totalDeductionCost
  ]);

  const ws = XLSX.utils.aoa_to_sheet(rows);

  ws['!cols'] = [
    { wch: 6 },  // No
    { wch: 20 }, // Waktu
    { wch: 26 }, // Nama Bahan
    { wch: 10 }, // Satuan
    { wch: 24 }, // Penyebab
    { wch: 12 }, // Stok Awal
    { wch: 18 }, // Jumlah Berkurang
    { wch: 16 }, // Sisa Stok
    { wch: 32 }, // Tujuan
    { wch: 24 }, // Referensi
    { wch: 18 }, // Pelanggan
    { wch: 14 }, // User
    { wch: 20 }  // Nilai Biaya
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Pengurangan Bahan');

  const filename = `Laporan_Pengurangan_Bahan_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
};

export const exportMaterialUsageToPDF = ({
  logs = [],
  periodLabel = 'Semua Waktu',
  activeMaterial = 'Semua Bahan Baku',
  activeEventType = 'Semua Penyebab',
  searchTerm = '',
  storeName = 'XCrepes POS'
}) => {
  // A4 Landscape
  const doc = new jsPDF('landscape', 'pt', 'a4');

  drawPDFHeader(
    doc,
    'Laporan Pengurangan Bahan Baku',
    'Audit Trail Mutasi Stok Berkurang (Penjualan, Dapur & Penyesuaian)',
    [
      { label: 'Periode', value: periodLabel },
      { label: 'Bahan Baku', value: activeMaterial },
      { label: 'Penyebab', value: `${activeEventType}${searchTerm ? ` ("${searchTerm}")` : ''}` }
    ],
    storeName
  );

  let totalCost = 0;
  let totalQty = 0;

  const tableBody = logs.map((log, idx) => {
    const eventName = log.eventBadgeText || (
      log.eventType === 'SALE' ? 'Penjualan Kasir' :
      log.eventType === 'MANUAL_OUT' ? 'Dapur / Manual' :
      log.eventType === 'ADJUST' ? 'Penyesuaian Opname' :
      'Pemakaian Stok'
    );

    const qty = Number(log.amount ?? log.quantityDeducted ?? 0);
    const cost = Number(log.totalEstimatedValue ?? 0);
    const prevStock = Number(log.previousStock ?? 0);
    const curStock = Number(log.currentStock ?? log.remainingStock ?? 0);

    totalQty += qty;
    totalCost += cost;

    let destination = '-';
    if (log.sourceMenu) {
      destination = log.sourceMenu;
      if (log.toppingName) {
        destination += `\n(+${log.toppingName})`;
      }
    }

    const referenceInfo = log.referenceInvoice ? `#${log.referenceInvoice}` : (log.note || '-');
    const unit = log.unitName ? ` ${log.unitName}` : '';
    const sign = log.type === 'IN' ? '+' : '-';
    const absQty = Math.abs(qty);

    // Format pergerakan perubahan stok yang sangat rapi, jelas, dan mudah dibaca
    const stockMovement = `Awal : ${formatNumber(prevStock)}${unit}\n-> Akhir: ${formatNumber(curStock)}${unit}`;
    const deductionText = `${sign}${formatNumber(absQty)}${unit}`;

    return [
      (idx + 1).toString(),
      formatDateTime(log.createdAt),
      log.rawMaterialName || '-',
      stockMovement,
      deductionText,
      eventName,
      destination,
      referenceInfo,
      formatIDR(cost)
    ];
  });

  const tableFoot = [
    [
      'TOTAL',
      `Ringkasan (${logs.length} Mutasi)`,
      '-',
      '-',
      formatNumber(totalQty),
      '-',
      '-',
      '-',
      formatIDR(totalCost)
    ]
  ];

  autoTable(doc, {
    startY: 78,
    head: [[
      'No',
      'Waktu & Tanggal',
      'Nama Bahan Baku',
      'Perubahan Stok\n(Awal -> Akhir)',
      'Jumlah\nPengurangan',
      'Penyebab / Kategori',
      'Tujuan Penggunaan',
      'No. Invoice / Catatan',
      'Nilai Biaya'
    ]],
    body: tableBody,
    foot: tableFoot,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 5,
      textColor: [30, 41, 59],
      valign: 'middle'
    },
    headStyles: {
      fillColor: [0, 96, 174],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 24 },
      1: { halign: 'left', cellWidth: 78 },
      2: { halign: 'left', fontStyle: 'bold', cellWidth: 105 },
      3: { halign: 'left', cellWidth: 120 },
      4: { halign: 'right', fontStyle: 'bold', cellWidth: 72 },
      5: { halign: 'left', cellWidth: 80 },
      6: { halign: 'left', cellWidth: 100 },
      7: { halign: 'left', cellWidth: 100 },
      8: { halign: 'right', fontStyle: 'bold', cellWidth: 85 }
    },
    margin: { left: 36, right: 36 }
  });

  setupPDFFooter(doc, storeName);

  const filename = `Laporan_Pengurangan_Bahan_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
};

/**
 * Export Stock Opname to Excel Spreadsheet
 */
export const exportStockOpnameToExcel = ({
  report = null,
  items = [],
  summary = null,
  storeName = 'XCrepes POS',
  conductedBy = null,
  isCashier = false
}) => {
  const sourceItems = (report?.items && Array.isArray(report.items) && report.items.length > 0)
    ? report.items
    : (Array.isArray(items) ? items : []);

  const rawDate = report?.opnameDate || report?.date;
  const displayDateStr = report?.displayDate || (rawDate ? formatDateIndonesian(rawDate) : null);

  const currentDateStr = new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const reporterName = report?.createdBy?.name || report?.submittedBy?.name || conductedBy || 'Kasir';
  const reportId = report?.id || '-';

  const isVoid = report?.status === 'VOID';
  const isApplied = Boolean(report?.isApplied || report?.status === 'APPLIED');
  const needsReapply = Boolean(report?.needsReapply || (report?.appliedAt && !report?.isApplied));

  let statusText = 'Menunggu Penerapan';
  if (isVoid) statusText = 'Dibatalkan (VOID)';
  else if (needsReapply) statusText = 'Perubahan Belum Diterapkan';
  else if (isApplied) statusText = 'Diterapkan ke Stok Sistem';

  let totalNetDiff = 0;
  let totalDiffVal = 0;
  let calcMatch = 0;
  let calcDeficit = 0;
  let calcSurplus = 0;

  const mappedRows = [];
  sourceItems.forEach((item, idx) => {
    const sysStock = Number(item.systemStock ?? item.stock ?? 0);
    const hasActual = item.actualStock !== '' && item.actualStock !== undefined && item.actualStock !== null;
    const actStock = hasActual ? Number(item.actualStock) : '-';
    const diff = hasActual ? Math.round((Number(item.actualStock) - sysStock) * 1000) / 1000 : '-';

    let statusLabel = 'Belum Dihitung';
    if (hasActual) {
      if (diff === 0) {
        statusLabel = 'Sesuai (Match)';
        calcMatch++;
      } else if (diff > 0) {
        statusLabel = `Lebih (Surplus +${diff})`;
        calcSurplus++;
      } else {
        statusLabel = `Kurang (Defisit ${diff})`;
        calcDeficit++;
      }
      totalNetDiff += diff;
    }

    const price = Number(item.pricePerUnit || item.price_per_unit || 0);
    const diffValue = hasActual && typeof diff === 'number' ? Math.round(diff * price) : 0;
    totalDiffVal += diffValue;

    const row = [
      idx + 1,
      item.id || item.rawMaterialId || '-',
      item.name || item.rawMaterialName || '-',
      item.categoryName || '-',
      item.unitName || item.unit || 'Unit',
      sysStock,
      actStock,
      hasActual && typeof diff === 'number' ? (diff > 0 ? `+${diff}` : diff) : '-',
      statusLabel
    ];

    if (!isCashier) {
      row.push(price, hasActual ? diffValue : '-');
    }
    row.push(item.adminNote || item.note || item.notes || item.reason || '-');

    mappedRows.push(row);
  });

  const totalMaterials = sourceItems.length;
  const matchCount = summary?.matchCount ?? calcMatch;
  const deficitCount = summary?.deficitCount ?? calcDeficit;
  const surplusCount = summary?.surplusCount ?? calcSurplus;
  const finalDiffVal = summary?.totalDifferenceValue ?? totalDiffVal;

  const rows = [
    [storeName.toUpperCase()],
    ['LAPORAN STOCK OPNAME FISIK BAHAN BAKU'],
    [`Tanggal Opname       : ${displayDateStr || currentDateStr}`],
    [`No. Laporan          : ${reportId}`],
    [`Status Laporan       : ${statusText}`],
    [`Petugas Pemeriksa    : ${reporterName}`],
    [`Total Bahan Dihitung : ${totalMaterials} Bahan`],
    [`Ringkasan Hasil      : Sesuai (${matchCount}), Kurang/Defisit (${deficitCount}), Lebih/Surplus (${surplusCount})`],
    [`Valuasi Total Selisih: ${formatIDR(finalDiffVal)}`],
    []
  ];

  const headerRow = [
    'No',
    'Kode Bahan',
    'Nama Bahan Baku',
    'Kategori',
    'Satuan',
    'Stok Sistem',
    'Stok Fisik (Aktual)',
    'Selisih (Fisik - Sistem)',
    'Status'
  ];

  if (!isCashier) {
    headerRow.push('Harga Beli Satuan (Rp)', 'Estimasi Nilai Selisih (Rp)');
  }
  headerRow.push('Catatan / Keterangan');

  rows.push(headerRow);
  mappedRows.forEach(r => rows.push(r));

  const ws = XLSX.utils.aoa_to_sheet(rows);

  ws['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 28 },
    { wch: 18 },
    { wch: 10 },
    { wch: 14 },
    { wch: 18 },
    { wch: 24 },
    { wch: 18 }
  ];
  if (!isCashier) {
    ws['!cols'].push({ wch: 20 }, { wch: 24 });
  }
  ws['!cols'].push({ wch: 30 });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Stock Opname');

  const cleanDateStr = (rawDate || new Date().toISOString().slice(0, 10)).replace(/[^0-9-]/g, '');
  const cleanIdStr = reportId !== '-' ? `_${reportId.replace(/[^a-zA-Z0-9_-]/g, '_')}` : '';
  const filename = `Stock_Opname_${cleanDateStr}${cleanIdStr}.xlsx`;
  XLSX.writeFile(wb, filename);
};

/**
 * Export Stock Opname to PDF Document (Landscape A4)
 * Supports passing either a complete `report` object, or individual parameters `{ items, summary, storeName, conductedBy, isCashier }`.
 */
export const exportStockOpnameToPDF = ({
  report = null,
  items = [],
  summary = null,
  storeName = 'XCrepes POS',
  conductedBy = null,
  isCashier = false
}) => {
  const doc = new jsPDF('landscape', 'pt', 'a4');

  const sourceItems = (report?.items && Array.isArray(report.items) && report.items.length > 0)
    ? report.items
    : (Array.isArray(items) ? items : []);

  const rawDate = report?.opnameDate || report?.date;
  const displayDateStr = report?.displayDate || (rawDate ? formatDateIndonesian(rawDate) : null);

  const currentDateStr = new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const reporterName = report?.createdBy?.name || report?.submittedBy?.name || conductedBy || 'Kasir';
  const reportId = report?.id || '-';

  const isVoid = report?.status === 'VOID';
  const isApplied = Boolean(report?.isApplied || report?.status === 'APPLIED');
  const needsReapply = Boolean(report?.needsReapply || (report?.appliedAt && !report?.isApplied));

  let statusText = 'Menunggu Penerapan';
  if (isVoid) statusText = 'Dibatalkan (VOID)';
  else if (needsReapply) statusText = 'Perubahan Belum Diterapkan';
  else if (isApplied) statusText = 'Diterapkan ke Stok Sistem';

  let totalNetDiff = 0;
  let totalDiffVal = 0;
  let calcMatch = 0;
  let calcDeficit = 0;
  let calcSurplus = 0;

  const tableBody = sourceItems.map((item, idx) => {
    const sysStock = Number(item.systemStock ?? item.stock ?? 0);
    const hasActual = item.actualStock !== '' && item.actualStock !== undefined && item.actualStock !== null;
    const actStock = hasActual ? Number(item.actualStock) : null;
    const diff = hasActual ? Math.round((actStock - sysStock) * 1000) / 1000 : null;

    let statusLabel = 'Belum Dihitung';
    if (hasActual) {
      if (diff === 0) {
        statusLabel = 'Cocok';
        calcMatch++;
      } else if (diff > 0) {
        statusLabel = `Lebih (+${diff})`;
        calcSurplus++;
      } else {
        statusLabel = `Kurang (${diff})`;
        calcDeficit++;
      }
      totalNetDiff += diff;
    }

    const price = Number(item.pricePerUnit || item.price_per_unit || 0);
    const itemDiffVal = hasActual && diff !== null ? Math.round(diff * price) : 0;
    totalDiffVal += itemDiffVal;

    const row = [
      (idx + 1).toString(),
      item.name || item.rawMaterialName || '-',
      item.categoryName || '-',
      item.unitName || item.unit || 'Unit',
      formatNumber(sysStock),
      hasActual ? formatNumber(actStock) : '-',
      hasActual ? (diff > 0 ? `+${formatNumber(diff)}` : formatNumber(diff)) : '-',
      statusLabel
    ];

    if (!isCashier) {
      row.push(hasActual ? (itemDiffVal === 0 ? 'Rp 0' : formatIDR(itemDiffVal)) : '-');
    }
    row.push(item.adminNote || item.note || item.notes || item.reason || '-');

    return row;
  });

  const totalMaterials = sourceItems.length;
  const matchCount = summary?.matchCount ?? calcMatch;
  const deficitCount = summary?.deficitCount ?? calcDeficit;
  const surplusCount = summary?.surplusCount ?? calcSurplus;
  const finalDiffVal = summary?.totalDifferenceValue ?? totalDiffVal;

  const metaItems = [
    { label: 'Tanggal Opname', value: displayDateStr || currentDateStr },
    { label: 'No. Laporan', value: reportId },
    { label: 'Petugas Kasir', value: reporterName },
    { label: 'Status Laporan', value: statusText }
  ];

  if (isApplied && report?.appliedBy?.name) {
    const appliedTime = report.appliedAt ? formatDateTimeIndonesian(report.appliedAt) : '';
    metaItems.push({
      label: 'Diterapkan Oleh',
      value: `${report.appliedBy.name}${appliedTime ? ` (${appliedTime})` : ''}`
    });
  }

  const dividerY = drawPDFHeader(
    doc,
    'Laporan Hasil Stock Opname Fisik Bahan Baku',
    'Rekapitulasi Hasil Audit Perbandingan Stok Sistem vs Fisik Aktual',
    metaItems,
    storeName
  );

  const headRow = [
    'No',
    'Nama Bahan Baku',
    'Kategori',
    'Satuan',
    'Stok Sistem',
    'Stok Fisik',
    'Selisih',
    'Status'
  ];

  if (!isCashier) {
    headRow.push('Nilai Selisih');
  }
  headRow.push('Catatan');

  // Summary footer row
  const footRow = [
    'TOTAL',
    `Total: ${totalMaterials} Bahan Baku`,
    '-',
    '-',
    '-',
    '-',
    (totalNetDiff > 0 ? `+${formatNumber(totalNetDiff)}` : formatNumber(totalNetDiff)),
    `Cocok: ${matchCount} | Kurang: ${deficitCount} | Lebih: ${surplusCount}`
  ];

  if (!isCashier) {
    footRow.push(formatIDR(finalDiffVal));
  }
  footRow.push('-');

  const columnStyles = {
    0: { halign: 'center', cellWidth: 26 },
    1: { halign: 'left', fontStyle: 'bold', cellWidth: 140 },
    2: { halign: 'left', cellWidth: 85 },
    3: { halign: 'center', cellWidth: 45 },
    4: { halign: 'right', cellWidth: 65 },
    5: { halign: 'right', fontStyle: 'bold', cellWidth: 65 },
    6: { halign: 'right', fontStyle: 'bold', cellWidth: 65 },
    7: { halign: 'center', cellWidth: 75 }
  };

  if (!isCashier) {
    columnStyles[8] = { halign: 'right', fontStyle: 'bold', cellWidth: 85 };
    columnStyles[9] = { halign: 'left', cellWidth: 110 };
  } else {
    columnStyles[8] = { halign: 'left', cellWidth: 150 };
  }

  autoTable(doc, {
    startY: Math.max(78, (dividerY || 68) + 10),
    head: [headRow],
    body: tableBody,
    foot: [footRow],
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 5,
      textColor: [30, 41, 59],
      valign: 'middle'
    },
    headStyles: {
      fillColor: [0, 96, 174],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      fontSize: 8
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles,
    didParseCell: (data) => {
      // Color coding for Selisih column (column index 6)
      if (data.section === 'body' && data.column.index === 6) {
        const val = String(data.cell.raw || '');
        if (val.startsWith('+')) {
          data.cell.styles.textColor = [37, 99, 235]; // Blue
        } else if (val.startsWith('-')) {
          data.cell.styles.textColor = [220, 38, 38]; // Red
        } else if (val === '0' || val.startsWith('0')) {
          data.cell.styles.textColor = [5, 150, 105]; // Green
        }
      }
      // Color coding for Status column (column index 7)
      if (data.section === 'body' && data.column.index === 7) {
        const val = String(data.cell.raw || '');
        if (val.includes('Cocok')) {
          data.cell.styles.textColor = [5, 150, 105]; // Green
          data.cell.styles.fontStyle = 'bold';
        } else if (val.includes('Kurang')) {
          data.cell.styles.textColor = [220, 38, 38]; // Red
          data.cell.styles.fontStyle = 'bold';
        } else if (val.includes('Lebih')) {
          data.cell.styles.textColor = [37, 99, 235]; // Blue
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
    margin: { left: 36, right: 36 }
  });

  setupPDFFooter(doc, storeName);

  const cleanDateStr = (rawDate || new Date().toISOString().slice(0, 10)).replace(/[^0-9-]/g, '');
  const cleanIdStr = reportId !== '-' ? `_${reportId.replace(/[^a-zA-Z0-9_-]/g, '_')}` : '';
  const filename = `Stock_Opname_${cleanDateStr}${cleanIdStr}.pdf`;
  doc.save(filename);
};

export const exportSingleOpnameReportToPDF = exportStockOpnameToPDF;

/**
 * Export Summary of Multiple Stock Opname Reports to Excel
 */
export const exportOpnameSummaryReportToExcel = ({
  reports = [],
  periodLabel = 'Semua Periode',
  storeName = 'XCrepes POS'
}) => {
  const currentDateStr = new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const totalReports = reports.length;
  const submittedCount = reports.filter(r => r.status === 'SUBMITTED').length;
  const voidCount = reports.filter(r => r.status === 'VOID').length;

  let totalAudited = 0;
  let totalMatch = 0;
  let totalDeficit = 0;
  let totalSurplus = 0;
  let totalValuation = 0;

  reports.forEach(r => {
    if (r.status !== 'VOID') {
      totalAudited += (r.summary?.totalMaterials || r.items?.length || 0);
      totalMatch += (r.summary?.matchCount || 0);
      totalDeficit += (r.summary?.deficitCount || 0);
      totalSurplus += (r.summary?.surplusCount || 0);
      totalValuation += (r.summary?.totalDifferenceValue || 0);
    }
  });

  const rows = [
    [storeName.toUpperCase()],
    ['REKAPITULASI SUMMARY STOCK OPNAME BAHAN BAKU'],
    [`Periode Laporan       : ${periodLabel}`],
    [`Waktu Unduh           : ${currentDateStr} WIB`],
    [`Total Sesi Opname     : ${totalReports} Laporan (${submittedCount} Terkirim, ${voidCount} Dibatalkan)`],
    [`Total Bahan Diperiksa : ${totalAudited} Pemeriksaan Fisik`],
    [`Ringkasan Hasil Fisik : ${totalMatch} Cocok, ${totalDeficit} Defisit, ${totalSurplus} Surplus`],
    [`Total Valuasi Selisih : ${formatIDR(totalValuation)}`],
    []
  ];

  const headerRow = [
    'No',
    'ID Laporan',
    'Tanggal Opname',
    'Petugas Kasir',
    'Status Laporan',
    'Cakupan Bahan',
    'Item Cocok',
    'Item Kurang (Defisit)',
    'Item Lebih (Surplus)',
    'Valuasi Selisih (Rp)',
    'Versi',
    'Koreksi Admin'
  ];

  rows.push(headerRow);

  reports.forEach((report, idx) => {
    const isVoid = report.status === 'VOID';
    const sum = report.summary || {};
    const hasCorrection = (report.auditTrail || []).some(a => a.action === 'ADMIN_CORRECTION');

    rows.push([
      idx + 1,
      report.id || '-',
      report.displayDate || report.opnameDate || report.date || '-',
      report.submittedBy?.name || report.createdBy?.name || 'Kasir',
      isVoid ? 'DIBATALKAN (VOID)' : 'TERKIRIM',
      sum.totalMaterials || report.items?.length || 0,
      isVoid ? '-' : (sum.matchCount || 0),
      isVoid ? '-' : (sum.deficitCount || 0),
      isVoid ? '-' : (sum.surplusCount || 0),
      isVoid ? 0 : (sum.totalDifferenceValue || 0),
      `v${report.version || 1}`,
      hasCorrection ? 'Ada Koreksi Admin' : 'Tidak Ada'
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Summary Stock Opname');

  const filename = `Summary_Stock_Opname_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
};

/**
 * Export Summary of Multiple Stock Opname Reports to PDF
 */
export const exportOpnameSummaryReportToPDF = ({
  reports = [],
  periodLabel = 'Semua Periode',
  storeName = 'XCrepes POS'
}) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4'
  });

  drawPDFHeader(
    doc,
    'SUMMARY LAPORAN AUDIT STOCK OPNAME',
    'Rekapitulasi berkala pencatatan stok fisik, audit selisih fisik vs sistem, dan valuasi deviasi bahan baku.',
    [{ label: 'Periode Waktu', value: periodLabel }],
    storeName
  );

  const headRow = [
    'No',
    'ID Laporan & Tanggal',
    'Petugas Kasir',
    'Status',
    'Bahan',
    'Cocok',
    'Kurang',
    'Lebih',
    'Valuasi Selisih',
    'Versi & Koreksi'
  ];

  const tableBody = reports.map((report, idx) => {
    const isVoid = report.status === 'VOID';
    const sum = report.summary || {};
    const hasCorrection = (report.auditTrail || []).some(a => a.action === 'ADMIN_CORRECTION');
    const diffVal = sum.totalDifferenceValue || 0;

    return [
      idx + 1,
      `${report.id}\n${report.displayDate || report.opnameDate || report.date || '-'}`,
      report.submittedBy?.name || report.createdBy?.name || 'Kasir',
      isVoid ? 'VOID' : 'TERKIRIM',
      sum.totalMaterials || report.items?.length || 0,
      isVoid ? '-' : `${sum.matchCount || 0}`,
      isVoid ? '-' : `${sum.deficitCount || 0}`,
      isVoid ? '-' : `${sum.surplusCount || 0}`,
      isVoid ? '-' : (diffVal === 0 ? 'Rp 0' : formatIDR(diffVal)),
      `v${report.version || 1}${hasCorrection ? ' (Koreksi Admin)' : ''}`
    ];
  });

  autoTable(doc, {
    startY: 78,
    head: [headRow],
    body: tableBody,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 5,
      textColor: [30, 41, 59],
      valign: 'middle'
    },
    headStyles: {
      fillColor: [0, 96, 174],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 26 },
      1: { halign: 'left', fontStyle: 'bold', cellWidth: 140 },
      2: { halign: 'left', cellWidth: 110 },
      3: { halign: 'center', cellWidth: 65 },
      4: { halign: 'center', cellWidth: 45 },
      5: { halign: 'center', cellWidth: 45 },
      6: { halign: 'center', cellWidth: 45 },
      7: { halign: 'center', cellWidth: 45 },
      8: { halign: 'right', fontStyle: 'bold', cellWidth: 100 },
      9: { halign: 'center', cellWidth: 90 }
    },
    margin: { left: 36, right: 36 }
  });

  setupPDFFooter(doc, storeName);

  const filename = `Summary_Stock_Opname_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
};

