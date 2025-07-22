const tableBody = document.getElementById("tableBody");
const totalExclCell = document.getElementById("totalExcl");
const totalTaxCell = document.getElementById("totalTax");
const totalInclCell = document.getElementById("totalIncl");

function formatNumber(n) {
  return Math.round(n).toLocaleString(); // e.g. 38,908
}

function parseNumber(s) {
  return parseFloat(s.toString().replace(/,/g, "")) || 0;
}

function updateTotals() {
  let sumExcl = 0, sumTax = 0, sumIncl = 0;
  tableBody.querySelectorAll("tr").forEach(r => {
    sumExcl += parseNumber(r.querySelector(".amountExcl").textContent);
    sumTax += parseNumber(r.querySelector(".tax").textContent);
    sumIncl += parseNumber(r.querySelector(".amountIncl").textContent);
  });

  totalExclCell.textContent = formatNumber(sumExcl);
  totalTaxCell.textContent = formatNumber(sumTax);
  totalInclCell.textContent = formatNumber(sumIncl);
}

function calculateRow(row) {
  const retail = parseNumber(row.querySelector(".retail").value);
  const qty = parseNumber(row.querySelector(".qty").value);
  const rate = retail / 1.18;
  const excl = rate * qty;
  const tax = excl * 0.18;
  const incl = excl * 1.18;

  row.querySelector(".rate").textContent = retail && qty ? formatNumber(rate) : "0";
  row.querySelector(".amountExcl").textContent = retail && qty ? formatNumber(excl) : "0";
  row.querySelector(".tax").textContent = retail && qty ? formatNumber(tax) : "0";
  row.querySelector(".amountIncl").textContent = retail && qty ? formatNumber(incl) : "0";

  updateTotals();
}

function handleKeyNav(e) {
  const cell = e.target.closest("td");
  const row = cell.parentElement;
  const colIdx = Array.from(row.children).indexOf(cell);
  let target;

  // Prevent ↑ ↓ from incrementing values
  if (["ArrowUp", "ArrowDown"].includes(e.key)) {
    e.preventDefault();
  }

  switch (e.key) {
    case "ArrowRight":
      target = row.children[colIdx + 1]?.querySelector("input");
      break;
    case "ArrowLeft":
      target = row.children[colIdx - 1]?.querySelector("input");
      break;
    case "ArrowDown":
      target = row.nextElementSibling?.children[colIdx]?.querySelector("input");
      break;
    case "ArrowUp":
      target = row.previousElementSibling?.children[colIdx]?.querySelector("input");
      break;
    case "Enter":
      if (row === tableBody.lastElementChild) {
        e.preventDefault();
        addRow();
      }
      break;
  }

  if (target) {
    target.focus();
    target.select();
  }
}

function addRow() {
  const idx = tableBody.rows.length + 1;
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${idx}</td>
    <td><input type="number" class="retail" step="0.01"></td>
    <td><input type="number" class="qty" step="1"></td>
    <td><input type="text" class="desc"></td>
    <td class="rate" data-auto="true">0</td>
    <td class="amountExcl" data-auto="true">0</td>
    <td class="tax" data-auto="true">0</td>
    <td class="amountIncl" data-auto="true">0</td>
    <td><button class="delete-btn">❌</button></td>
  `;

  const retailInput = tr.querySelector(".retail");
  const qtyInput = tr.querySelector(".qty");
  const deleteBtn = tr.querySelector(".delete-btn");

  retailInput.addEventListener("input", () => calculateRow(tr));
  qtyInput.addEventListener("input", () => calculateRow(tr));
  tr.addEventListener("keydown", handleKeyNav);

  deleteBtn.addEventListener("click", () => {
    tr.remove();
    reindexRows();
    updateTotals();
  });

  tableBody.appendChild(tr);
  retailInput.focus();
}

function reindexRows() {
  Array.from(tableBody.rows).forEach((r, i) => {
    r.cells[0].textContent = i + 1;
  });
}

function exportCSV() {
  const rows = [...tableBody.rows];
  let csv = "S.No,Retail Rate,Qty,Description,Rate,Amount Excl. Tax,Sales Tax (18%),Amount Incl. Tax\n";
  rows.forEach(r => {
    const values = [
      r.cells[0].textContent,
      r.querySelector(".retail").value || "",
      r.querySelector(".qty").value || "",
      `"${r.querySelector(".desc").value.replace(/"/g,'""')}"`,
      r.querySelector(".rate").textContent.replace(/,/g,""),
      r.querySelector(".amountExcl").textContent.replace(/,/g,""),
      r.querySelector(".tax").textContent.replace(/,/g,""),
      r.querySelector(".amountIncl").textContent.replace(/,/g,""),
    ];
    csv += values.join(",") + "\n";
  });

  const link = document.createElement("a");
  link.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
  link.download = "sales_tax.csv";
  link.click();
}

// Initialize the table with one row
addRow();
