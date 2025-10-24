// ======== متغيرات عامة ========
let products = [];
let orders = [];
let selectedProducts = [];
let currentPage = 1;
const ordersPerPage = 10;

// ======== Popups ========
const addProductPopup = document.getElementById("addProductPopup");
const productsPopup = document.getElementById("productsPopup");
const ordersPopup = document.getElementById("ordersPopup");
const selectProductsPopup = document.getElementById("selectProductsPopup");

// ======== عناصر داخل popup المنتجات ========
const popupProductsContainer = document.getElementById("popupProductsContainer");

// ======== أزرار ========
const openAddProductPopupBtn = document.getElementById("openAddProductPopupBtn");
const cancelAddProductBtn = document.getElementById("cancelAddProductBtn");
const saveNewProductBtn = document.getElementById("saveNewProductBtn");
const addComponentBtn = document.getElementById("addComponentBtn");
const showProductsBtn = document.getElementById("showProductsBtn");
const showOrdersBtn = document.getElementById("showOrdersBtn");
const closeProductsPopupBtn = document.getElementById("closeProductsPopupBtn");
const closeOrdersPopupBtn = document.getElementById("closeOrdersPopupBtn");
const selectProductsBtn = document.getElementById("selectProductsBtn");
const confirmSelectionBtn = document.getElementById("confirmSelectionBtn");
const cancelSelectionBtn = document.getElementById("cancelSelectionBtn");
const filterMonthInput = document.getElementById("filterMonth");

// عناصر تعديل المنتج (popup edit)
const editAddComponentBtn = document.getElementById("editAddComponentBtn");
const cancelEditProductBtn = document.getElementById("cancelEditProductBtn");
const saveEditProductBtn = document.getElementById("saveEditProductBtn");

// ======== Popup تعديل الأوردر ========
const editOrderPopup = document.createElement("div");
editOrderPopup.id = "editOrderPopup";
editOrderPopup.className = "popup";
document.body.appendChild(editOrderPopup);

// ======== رابط السيرفر ========
const SERVER_URL = "https://oradesign.onrender.com";

// ======== تحميل البيانات من السيرفر ========
async function fetchData() {
  try {
    const [resProducts, resOrders] = await Promise.all([
      fetch(`${SERVER_URL}/api/products`),
      fetch(`${SERVER_URL}/api/orders`)
    ]);
    products = resProducts.ok ? await resProducts.json() : [];
    orders = resOrders.ok ? await resOrders.json() : [];
  } catch (err) {
    console.error("❌ Error fetching data:", err);
    alert("⚠️ لم يتم تحميل البيانات من السيرفر");
  }
}
window.addEventListener("DOMContentLoaded", fetchData);

// ======== فتح وغلق الـ Popups ========
function togglePopup(popup, show = true) {
  if (!popup) return;
  if (show) {
    popup.classList.add("show");
    popup.style.display = "flex";
  } else {
    popup.classList.remove("show");
    setTimeout(() => (popup.style.display = "none"), 300);
  }
}

openAddProductPopupBtn && openAddProductPopupBtn.addEventListener("click", () => togglePopup(addProductPopup));
cancelAddProductBtn && cancelAddProductBtn.addEventListener("click", () => togglePopup(addProductPopup, false));
closeProductsPopupBtn && closeProductsPopupBtn.addEventListener("click", () => togglePopup(productsPopup, false));
closeOrdersPopupBtn && closeOrdersPopupBtn.addEventListener("click", () => togglePopup(ordersPopup, false));
cancelSelectionBtn && cancelSelectionBtn.addEventListener("click", () => togglePopup(selectProductsPopup, false));
document.getElementById("cancelEditOrder") && document.getElementById("cancelEditOrder").addEventListener("click", () => togglePopup(editOrderPopup, false));

// ======== إضافة مكونات المنتج (Popup إضافة) ========
addComponentBtn && addComponentBtn.addEventListener("click", () => {
  const container = document.getElementById("newComponentsContainer");
  const div = document.createElement("div");
  div.classList.add("component-item");
  div.innerHTML = `<input type="text" placeholder="اسم المكون" class="compName" />
                   <input type="number" placeholder="سعر المكون" class="compPrice" />`;
  container.appendChild(div);
  div.querySelectorAll("input").forEach(inp => inp.addEventListener("input", updateNewProductTotal));
});

function updateNewProductTotal() {
  let total = 0;
  document.querySelectorAll(".component-item .compPrice").forEach(input => total += Number(input.value) || 0);
  const el = document.getElementById("newProductTotalCostDisplay");
  if (el) el.textContent = total.toFixed(2);
}

// ======== إضافة منتج جديد ========
saveNewProductBtn && saveNewProductBtn.addEventListener("click", async () => {
  const nameEl = document.getElementById("newProductName");
  const sellingPriceEl = document.getElementById("newProductSellingPrice");
  if (!nameEl || !sellingPriceEl) return alert("⚠️ عناصر الإدخال ناقصة");

  const name = nameEl.value.trim();
  const sellingPrice = parseFloat(sellingPriceEl.value);
  const imageFile = document.getElementById("newProductImage").files[0];

  if (!name || !sellingPrice) return alert("⚠️ أدخلي اسم المنتج والسعر");

  const components = Array.from(document.querySelectorAll(".component-item")).map(div => ({
    name: div.querySelector(".compName").value,
    price: Number(div.querySelector(".compPrice").value) || 0
  }));

  const totalCost = components.reduce((sum, c) => sum + c.price, 0);
  const profit = sellingPrice - totalCost;

  const formData = new FormData();
  formData.append("name", name);
  formData.append("sellingPrice", sellingPrice);
  formData.append("totalCost", totalCost);
  formData.append("profit", profit);
  formData.append("components", JSON.stringify(components));
  if (imageFile) formData.append("imageUrl", imageFile);

  try {
    const res = await fetch(`${SERVER_URL}/api/products`, { method: "POST", body: formData });
    if (res.ok) {
      const data = await res.json();
      products.push(data);
      togglePopup(addProductPopup, false);
      alert("✅ تم تسجيل المنتج بنجاح");
    } else {
      console.error("❌ خطأ أثناء الحفظ:", await res.text());
      alert("❌ حدث خطأ أثناء حفظ المنتج");
    }
  } catch (err) {
    console.error("⚠️ خطأ في الاتصال بالسيرفر:", err);
    alert("⚠️ لم يتم الاتصال بالسيرفر، يرجى التأكد من تشغيل السيرفر");
  }
});

// ======== بقية الكود يبقى زي ما هو ========
// ======== إضافة أوردر ========
document.getElementById("orderForm") && document.getElementById("orderForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!selectedProducts.length) return alert("⚠️ اختاري منتجات أولاً");

  const totalCost = parseFloat(document.getElementById('totalCost').value) || 0;
  const sellingPrice = parseFloat(document.getElementById('sellingPrice').value) || 0;
  const profit = parseFloat(document.getElementById('profit').value) || 0;

  const order = {
    customerName: document.getElementById("customerName").value,
    address: document.getElementById("address").value,
    phone: document.getElementById("phone").value,
    deliveryDate: document.getElementById("deliveryDate").value,
    status: document.getElementById("status").value,
    products: selectedProducts.map(p => ({
      name: p.product.name,
      qty: p.qty,
      sellingPrice: p.product.sellingPrice,
      totalCost: p.product.totalCost ?? 0
    })),
    totalCost,
    sellingPrice,
    profit
  };

  try {
    const res = await fetch(`${SERVER_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order)
    });
    if (res.ok) {
      const data = await res.json();
      orders.push(data);
      e.target.reset();
      selectedProducts = [];
      document.getElementById("productsList").innerHTML = "";
      await fetchData();
      alert("✅ تم تسجيل الأوردر بنجاح");
    } else {
      console.error("❌ خطأ أثناء حفظ الأوردر:", await res.text());
    }
  } catch (err) {
    console.error("⚠️ خطأ في الاتصال بالسيرفر:", err);
  }
});

// ======== عرض المنتجات ========
function loadProductsTable() {
  const container = document.getElementById("productsTableBody");
  if (!container) return;
  container.innerHTML = "";

  if (!products.length) {
    container.innerHTML = "<p style='text-align:center;'>لا توجد منتجات بعد</p>";
    return;
  }

  const cardsContainer = document.createElement("div");
  cardsContainer.classList.add("cards-container");

  products.forEach(p => {
    const card = document.createElement("div");
    card.classList.add("product-card");
    const imgSrc = p.imageUrl || "assets/images/placeholder.png";
    card.innerHTML = `
      <img src="${imgSrc}" alt="${p.name}" />
      <h4>${p.name}</h4>
      <p>السعر: ${Number(p.sellingPrice || 0).toFixed(2)}</p>
    `;
    card.addEventListener("click", () => openEditPopup(p));
    cardsContainer.appendChild(card);
  });

  container.appendChild(cardsContainer);
}

function updateOrdersSummary(orderList = orders, filterMonthYear) {
  const ordersCountElem = document.getElementById("ordersCount");
  const totalProfitOverallElem = document.getElementById("totalProfitOverall");
  const totalProfitFilteredElem = document.getElementById("totalProfitFiltered");

  if (!ordersCountElem || !totalProfitOverallElem || !totalProfitFilteredElem) return;

  // عدد الأوردرات
  ordersCountElem.textContent = orderList.length;

  // الربح الكلي لكل الأوردرات
  const totalProfitOverall = orders.reduce((sum, o) => sum + (o.profit || 0), 0);
  totalProfitOverallElem.textContent = totalProfitOverall.toFixed(2);

  // تحديد الشهر والسنه للفلتر
  let year, month;
  if (filterMonthYear) {
    [year, month] = filterMonthYear.split("-").map(Number);
  } else {
    const now = new Date();
    year = now.getFullYear();
    month = now.getMonth() + 1;
  }

  // الربح الشهري حسب الفلتر
  const totalProfitFiltered = orderList.reduce((sum, o) => {
    const d = new Date(o.deliveryDate);
    if (isNaN(d)) return sum; // لو الديت غير صالح
    if (d.getFullYear() === year && d.getMonth() + 1 === month) {
      return sum + (o.profit || 0);
    }
    return sum;
  }, 0);

  totalProfitFilteredElem.textContent = totalProfitFiltered.toFixed(2);
}



// ======== عرض الأوردرات مع Pagination ========
function loadOrdersTable(orderList = orders) {
  const tbody = document.querySelector("#ordersTable tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  const totalPages = Math.ceil(orderList.length / ordersPerPage);
  if (currentPage > totalPages) currentPage = totalPages || 1;

  const startIndex = (currentPage - 1) * ordersPerPage;
  const paginatedOrders = orderList.slice(startIndex, startIndex + ordersPerPage);

  function formatStatus(status) {
    if (status === "delivered" || status === "تم التسليم") return "تم التسليم";
    if (status === "pending" || status === "قيد التنفيذ") return "قيد التنفيذ";
    return status;
  }

  paginatedOrders.forEach((o, i) => {
    const date = new Date(o.deliveryDate || Date.now());
    const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

    const tr = document.createElement("tr");
    tr.dataset.index = startIndex + i;
    tr.dataset.id = o._id || "";
    tr.innerHTML = `
      <td>${startIndex + i + 1}</td>
      <td>${o.customerName || ""}</td>
      <td>${o.address || ""}</td>
      <td>${o.phone || ""}</td>
      <td>${(o.products || []).map(p => `${p.name} × ${p.qty}`).join("<br>")}</td>
      <td>${(o.sellingPrice || 0).toFixed(2)}</td>
      <td>${(o.totalCost || 0).toFixed(2)}</td>
      <td>${(o.profit || 0).toFixed(2)}</td>
      <td>${formattedDate}</td>
      <td><span class="status-text">${formatStatus(o.status)}</span></td>
    `;
    tbody.appendChild(tr);
  });

  addRowClickEditEvents(orderList);
  updateOrdersSummary(orderList);
  renderPaginationArrows(orderList, totalPages);
}

// ======== Pagination للأوردرات ========
function renderPaginationArrows(orderList) {
  const paginationContainer = document.getElementById("pagination");
  if (!paginationContainer) return;

  paginationContainer.innerHTML = "";

  const totalPages = Math.ceil(orderList.length / ordersPerPage);
  if (currentPage > totalPages) currentPage = totalPages || 1;

  const prevBtn = document.createElement("button");
  prevBtn.innerHTML = `<i class="fa-solid fa-chevron-right"></i>`;
  prevBtn.disabled = currentPage === 1;
  prevBtn.addEventListener("click", () => { currentPage--; loadOrdersTable(orderList); });
  paginationContainer.appendChild(prevBtn);

  const pageNumber = document.createElement("span");
  pageNumber.textContent = currentPage;
  pageNumber.style.margin = "0 10px";
  pageNumber.style.fontWeight = "bold";
  paginationContainer.appendChild(pageNumber);

  const nextBtn = document.createElement("button");
  nextBtn.innerHTML = `<i class="fa-solid fa-chevron-left"></i>`;
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.addEventListener("click", () => { currentPage++; loadOrdersTable(orderList); });
  paginationContainer.appendChild(nextBtn);
}

// ======== click على الصف لتعديل ========
// ======== click على الصف لتعديل ========
function addRowClickEditEvents(orderList) {
  document.querySelectorAll("#ordersTable tbody tr").forEach(tr => {
    tr.addEventListener("click", async () => {
      const orderId = tr.dataset.id;
      const order = orders.find(o => o._id === orderId);
      if (!order) return alert("❌ لم يتم العثور على الأوردر");

      const editOrderPopup = document.getElementById("editOrderPopup");
      if (!editOrderPopup) return alert("❌ لم يتم العثور على نافذة التعديل في الـ HTML");

      togglePopup(editOrderPopup, true);

      // تعبئة بيانات الأوردر
      document.getElementById("editCustomerName").value = order.customerName || "";
      document.getElementById("editAddress").value = order.address || "";
      document.getElementById("editPhone").value = order.phone || "";
      document.getElementById("editDeliveryDate").value = (order.deliveryDate || "").slice(0, 10);
      document.getElementById("editStatus").value = order.status || "";

      const container = document.getElementById("editProductsContainer");
      container.innerHTML = "";
      (order.products || []).forEach((p, i) => {
        const div = document.createElement("div");
        div.innerHTML = `<span>${p.name}</span> × <input type="number" value="${p.qty}" min="1" data-index="${i}">`;
        container.appendChild(div);
      });

      // ===== الكرتونة =====
      const addCartonBtn = document.getElementById("addCartonBtn");
      const cartonContainer = document.getElementById("cartonInputContainer");
      const cartonPriceInput = document.getElementById("cartonPriceInput");
      const saveCartonBtn = document.getElementById("saveCartonBtn");
      const profitInput = document.getElementById("editOrderProfit");

      let cartonPrice = order.cartonPrice || 0;
      let baseSelling = order.sellingPrice || 0;
      let baseCost = order.totalCost || 0;

      // تحديث الربح بعد خصم الكرتونة
      let baseProfit = baseSelling - baseCost - cartonPrice;
      profitInput.value = baseProfit.toFixed(2);

      if (cartonPrice > 0) {
        cartonContainer.style.display = "block";
        cartonPriceInput.value = cartonPrice;
      } else {
        cartonContainer.style.display = "none";
        cartonPriceInput.value = "";
      }

      addCartonBtn.onclick = () => {
        cartonContainer.style.display =
          cartonContainer.style.display === "none" ? "block" : "none";
      };

      saveCartonBtn.onclick = () => {
        const newCartonPrice = Number(cartonPriceInput.value);
        if (isNaN(newCartonPrice) || newCartonPrice <= 0) {
          alert("❌ اكتبي سعر كرتونة صالح");
          return;
        }

        cartonPrice = newCartonPrice;

        // تحديث الربح والتكلفة
        order.cartonPrice = cartonPrice;
        order.totalCost = baseCost + cartonPrice;
        order.profit = baseSelling - order.totalCost;

        // إضافة نص داخل الأوردر يوضح وجود الكرتونة
        order.note = `هذا الأوردر مع كرتونة بسعر ${cartonPrice}`;

        profitInput.value = order.profit.toFixed(2);

        alert("✅ تم إضافة الكرتونة وخصمها من الربح وتسجيلها في الوصف");
      };

      // ===== عند حفظ التعديلات =====
      document.getElementById("editOrderForm").onsubmit = async (e) => {
        e.preventDefault();

        // تحديث بيانات الأوردر
        order.customerName = document.getElementById("editCustomerName").value;
        order.address = document.getElementById("editAddress").value;
        order.phone = document.getElementById("editPhone").value;
        order.deliveryDate = document.getElementById("editDeliveryDate").value;
        order.status = document.getElementById("editStatus").value;

        // تحديث الكميات
        container.querySelectorAll("input[data-index]").forEach(input => {
          const idx = Number(input.dataset.index);
          order.products[idx].qty = Number(input.value);
        });

        // إعادة الحسابات
        order.sellingPrice = order.products.reduce((s, p) => s + (p.sellingPrice || 0) * p.qty, 0);
        const baseTotalCost = order.products.reduce((s, p) => s + (p.totalCost || 0) * p.qty, 0);
        const cartonExtra = order.cartonPrice || 0;

        order.totalCost = baseTotalCost + cartonExtra;
        order.profit = order.sellingPrice - order.totalCost;

        // إضافة نص الكرتونة إذا موجود
        if (cartonExtra > 0) order.note = `هذا الأوردر مع كرتونة بسعر ${cartonExtra}`;

        // حفظ للسيرفر
        try {
          const res = await fetch(`${SERVER_URL}/api/orders/${orderId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(order)
          });

          if (!res.ok) {
            const text = await res.text();
            console.error("❌ خطأ في تحديث الأوردر:", text);
            throw new Error(text || "خطأ غير معروف");
          }

          togglePopup(editOrderPopup, false);
          await fetchData();
          loadOrdersTable(orderList);
          alert("✅ تم حفظ التعديلات بنجاح");
        } catch (err) {
          console.error(err);
          alert("❌ حدث خطأ أثناء حفظ التعديلات: " + err.message);
        }
      };
    });
  });
}


// ======== أزرار رئيسية ========
showProductsBtn && showProductsBtn.addEventListener("click", async () => {
  if (!products.length) await fetchData();
  loadProductsTable();
  togglePopup(productsPopup);
});

showOrdersBtn && showOrdersBtn.addEventListener("click", async () => {
  try {
    const res = await fetch(`${SERVER_URL}/api/orders`);
    if (!res.ok) throw new Error("خطأ في السيرفر");
    orders = await res.json();
    loadOrdersTable();
    togglePopup(ordersPopup);
  } catch (err) {
    console.error(err);
    alert("❌ حدث خطأ، تحقق من السيرفر: " + err.message);
  }
});

showOrdersBtn && showOrdersBtn.addEventListener("click", fetchOrdersAndOpenLastPage);

// ======== Popup اختيار المنتجات ========
selectProductsBtn && selectProductsBtn.addEventListener('click', () => {
  if (!popupProductsContainer) return alert("عنصر popupProductsContainer غير موجود في HTML");
  popupProductsContainer.innerHTML = '';

  products.forEach((p, i) => {
    const div = document.createElement('div');
    div.className = 'product-card';

    // اجعل اسم الحقل للمكونات هو price (موحد)
    let compHtml = '';
    if (p.components?.length) {
      compHtml = `
        <button type="button" class="customize-btn">تخصيص المكونات</button>
        <div class="components" style="display:none;">
          ${p.components.map(c => `
            <label>
              <input type="checkbox" class="component-checkbox" data-price="${(c.price || 0)}" data-name="${c.name}" checked> 
              ${c.name} - ${(c.price || 0).toFixed(2)} جنيه
            </label>
          `).join('')}
        </div>
      `;
    }

    div.innerHTML = `
      <img src="${p.imageUrl || 'assets/images/placeholder.png'}" alt="${p.name}">
      <strong>${p.name}</strong>
      <label>الكمية: <input type="number" class="popup-qty" value="0" min="0"></label>
      <span>سعر المنتج: <span class="product-total-price">${Number(p.sellingPrice || 0).toFixed(2)}</span> جنيه</span>
      ${compHtml}
    `;

    popupProductsContainer.appendChild(div);

    const btn = div.querySelector('.customize-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        const comps = div.querySelector('.components');
        comps.style.display = comps.style.display === 'none' ? 'block' : 'none';

        // تحديث السعر لو المكونات اتغيرت
        comps.querySelectorAll('.component-checkbox').forEach(chk => {
          chk.addEventListener('change', () => {
            const basePrice = Number(products[i].sellingPrice || 0);
            const selectedComps = Array.from(comps.querySelectorAll('.component-checkbox:checked'))
              .reduce((sum, c) => sum + Number(c.dataset.price || 0), 0);
            const newTotal = basePrice + selectedComps;

            div.querySelector('.product-total-price').textContent = newTotal.toFixed(2);
          });
        });
      });
    }
  });

  togglePopup(selectProductsPopup);
});

// ======== تأكيد اختيار المنتجات ========
confirmSelectionBtn && confirmSelectionBtn.addEventListener('click', () => {
  selectedProducts = [];
  const productsList = document.getElementById('productsList');
  productsList.innerHTML = '';

  popupProductsContainer.querySelectorAll('.product-card').forEach((card, i) => {
    const qty = Number(card.querySelector('.popup-qty').value);
    if (qty > 0) {
      const selectedComps = Array.from(card.querySelectorAll('.component-checkbox:checked')).map(chk => ({
        name: chk.dataset.name,
        price: Number(chk.dataset.price)
      }));

      // إذا المكونات الفارغة، خذ المكونات الأصلية من products[i]
      const compsFinal = (selectedComps.length > 0) ? selectedComps : (products[i].components || []);

      selectedProducts.push({ product: products[i], qty, components: compsFinal });

      const totalPrice = (Number(products[i].sellingPrice || 0) * qty).toFixed(2);
      const div = document.createElement('div');
      div.textContent = `${products[i].name} - الكمية: ${qty} - السعر: ${totalPrice} جنيه`;
      productsList.appendChild(div);
    }
  });

  updateTotals();
  togglePopup(selectProductsPopup, false);
});

// ======== حساب الأسعار الإجمالية ========
function updateTotals() {
  let totalCost = 0, sellingPrice = 0;

  selectedProducts.forEach(p => {
    const compsCost = (p.components || []).reduce((sum, c) => sum + (Number(c.price) || 0), 0);
    totalCost += compsCost * p.qty;
    sellingPrice += Number(p.product.sellingPrice || 0) * p.qty;
  });

  const profit = sellingPrice - totalCost;

  document.getElementById('totalCost').value = totalCost.toFixed(2);
  document.getElementById('sellingPrice').value = sellingPrice.toFixed(2);
  document.getElementById('profit').value = profit.toFixed(2);
}


// فلتر الشهر
filterMonthInput && filterMonthInput.addEventListener("change", () => {
  currentPage = 1;
  const selectedMonth = filterMonthInput.value;
  if (!selectedMonth) return loadOrdersTable(orders);

  const [year, month] = selectedMonth.split("-").map(Number);
  const filteredOrders = orders.filter(o => {
    const date = new Date(o.deliveryDate);
    return date.getFullYear() === year && date.getMonth() + 1 === month;
  });

  loadOrdersTable(filteredOrders);
  updateOrdersSummary(filteredOrders, selectedMonth); // هنبعت الشهر هنا
});



// ======== CSV export (كما كان عندك) ========
function exportToCSV(data, filename = "data.csv") {
  if (!data || !data.length) return alert("⚠️ لا توجد بيانات للتصدير");
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(","),
    ...data.map(row => headers.map(field => {
      let value = row[field];
      if (typeof value === "object") value = JSON.stringify(value);
      return `"${value}"`;
    }).join(","))
  ];
  const csvString = csvRows.join("\n");
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
document.getElementById("exportOrdersBtn") && document.getElementById("exportOrdersBtn").addEventListener("click", () => {
  exportOrdersToCSV(orders);
});

function exportOrdersToCSV(orders, filename = "orders.csv") {
  if (!orders || !orders.length) return alert("⚠️ لا توجد أوردرات للتصدير");

  const headers = [
    "الرقم", "اسم العميل", "العنوان", "رقم الهاتف", "المشتريات", "السعر الإجمالي",
    "تكلفة الأوردر", "الربح", "تاريخ التسليم", "الحالة"
  ];
  const csvRows = [headers.join(",")];

  orders.forEach((order, index) => {
    const purchases = (order.products || []).map(p => `${p.name} × ${p.qty}`).join(" | ");
    const row = [
      index + 1,
      order.customerName || "",
      order.address || "",
      order.phone || "",
      purchases,
      (order.sellingPrice || 0).toFixed(2),
      (order.totalCost || 0).toFixed(2),
      (order.profit || 0).toFixed(2),
      new Date(order.deliveryDate || Date.now()).toLocaleDateString("ar-EG"),
      order.status || ""
    ];
    csvRows.push(row.map(val => `"${val}"`).join(","));
  });

  const csvString = csvRows.join("\n");
  const blob = new Blob(["\uFEFF" + csvString], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// زر إغلاق
closeOrdersPopupBtn && closeOrdersPopupBtn.addEventListener("click", () => togglePopup(ordersPopup, false));

// ======== فتح آخر صفحة بعد تحميل الأوردرات (كما طلبتي سابقًا) ========
async function fetchOrdersAndOpenLastPage() {
  try {
    const res = await fetch(`${SERVER_URL}/api/orders`);
    if (!res.ok) throw new Error("خطأ في تحميل الأوردرات");
    orders = await res.json();

    // 🔹 ترتيب الأوردرات حسب التاريخ (تصاعدي من الأقدم للأحدث)
    orders.sort((a, b) => new Date(a.deliveryDate) - new Date(b.deliveryDate));


    const totalPages = Math.ceil(orders.length / ordersPerPage);
    currentPage = totalPages > 0 ? totalPages : 1;
    loadOrdersTable(orders);
    togglePopup(ordersPopup, true);
    setTimeout(() => { ordersPopup.scrollTo(0, ordersPopup.scrollHeight); }, 300);
  } catch (err) {
    console.error("❌ Error:", err);
    alert("⚠️ لم يتم تحميل الأوردرات");
  }
}

/* ======= ==== تعديل المنتجات - فتح popup التعديل وحفظ التغييرات ==== */

// فتح نافذة التعديل (تستدعى عند الضغط على كارد المنتج)
function openEditPopup(product) {
  const popup = document.getElementById("editProductPopup");
  if (!popup) return;
  popup.style.display = "flex";
  popup.dataset.productId = product._id;

  document.getElementById("editProductName").value = product.name || "";
  document.getElementById("editProductSellingPrice").value = product.sellingPrice || 0;

  // المكونات: نستخدم key اسمها price
  const container = document.getElementById("editComponentsContainer");
  container.innerHTML = "<h4>المكونات:</h4>";
  if (product.components && product.components.length > 0) {
    product.components.forEach(c => {
      const div = document.createElement("div");
      div.classList.add("component-item");
      div.innerHTML = `
        <input type="text" class="editComponentName" placeholder="اسم المكون" value="${c.name}">
        <input type="number" class="editComponentPrice" placeholder="السعر" value="${Number(c.price || 0)}">
        <button type="button" class="remove-btn" onclick="this.parentElement.remove()">×</button>
      `;
      container.appendChild(div);
    });
  }
  updateEditTotalCost();
}

// إضافة مكون في popup التعديل
editAddComponentBtn && editAddComponentBtn.addEventListener("click", () => {
  const container = document.getElementById("editComponentsContainer");
  const div = document.createElement("div");
  div.classList.add("component-item");
  div.innerHTML = `
    <input type="text" class="editComponentName" placeholder="اسم المكون">
    <input type="number" class="editComponentPrice" placeholder="السعر">
    <button type="button" class="remove-btn" onclick="this.parentElement.remove()">×</button>
  `;
  container.appendChild(div);
});

// تحديث إجمالي سعر المكونات في التعديل
function updateEditTotalCost() {
  let total = 0;
  document.querySelectorAll(".editComponentPrice").forEach(input => {
    total += Number(input.value) || 0;
  });
  const el = document.getElementById("editProductTotalCostDisplay");
  if (el) el.textContent = total.toFixed(2);
}

document.addEventListener("input", e => {
  if (e.target.classList && e.target.classList.contains("editComponentPrice")) updateEditTotalCost();
});

// غلق popup التعديل
cancelEditProductBtn && cancelEditProductBtn.addEventListener("click", () => {
  document.getElementById("editProductPopup").style.display = "none";
});

// حفظ التعديلات
saveEditProductBtn && saveEditProductBtn.addEventListener("click", async () => {
  const popup = document.getElementById("editProductPopup");
  if (!popup) return alert("❌ خطأ داخلي: popup غير موجود");
  const id = popup.dataset.productId;
  const existingProduct = products.find(p => p._id === id);

  let components = [];
  document.querySelectorAll("#editComponentsContainer .component-item").forEach(item => {
    const name = item.querySelector(".editComponentName")?.value || "";
    const price = Number(item.querySelector(".editComponentPrice")?.value) || 0;
    if (name) components.push({ name, price });
  });

  // لو ما ضفتيش مكونات جديدة نحتفظ القديمة (وذلك لتجنب تحويلها لصفر)
  if (components.length === 0 && existingProduct?.components?.length) {
    components = existingProduct.components;
  }

  const formData = new FormData();
  formData.append("name", document.getElementById("editProductName").value);
  formData.append("sellingPrice", document.getElementById("editProductSellingPrice").value);
  formData.append("components", JSON.stringify(components));
  formData.append("totalCost", document.getElementById("editProductTotalCostDisplay").textContent || "0");

  const imageFile = document.getElementById("editProductImage").files[0];
  if (imageFile) formData.append("imageUrl", imageFile);

  try {
    const res = await fetch(`${SERVER_URL}/api/products/${id}`, {
      method: "PUT",
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      alert("✅ تم تعديل المنتج بنجاح");

      // حدث المنتج محليًا فورًا
      const index = products.findIndex(p => p._id === id);
      if (index !== -1) {
        products[index] = {
          ...products[index],
          name: document.getElementById("editProductName").value,
          sellingPrice: parseFloat(document.getElementById("editProductSellingPrice").value),
          components,
          totalCost: Number(document.getElementById("editProductTotalCostDisplay").textContent) || 0,
          // لو رفعتي صورة جديدة هنبتدي نعرض مؤقتاً objectURL
          imageUrl: imageFile ? URL.createObjectURL(imageFile) : products[index].imageUrl
        };
      }

      // جلب بيانات حديثة من السيرفر وحمل الجدول
      await fetchData();
      loadProductsTable();

      document.getElementById("editProductPopup").style.display = "none";
    } else {
      alert("❌ حدث خطأ أثناء التعديل: " + (data.error || "خطأ غير معروف"));
    }
  } catch (err) {
    console.error(err);
    alert("❌ فشل الاتصال بالسيرفر");
  }
});
// ======== زرار الخروج في اختيار المشتريات ========
document.getElementById("closeChooseProductsBtn").addEventListener("click", () => {
  document.getElementById("selectProductsPopup").style.display = "none";
});
//========= Tools ===============
let tools = [];

// ======== جلب الأوردرز من السيرفر ========
async function fetchOrders() {
  try {
    const res = await fetch('${SERVER_URL}/api/orders');
    orders = await res.json();
    updateProfitDisplay();
  } catch (err) {
    console.error(err);
  }
}

// ======== جلب الأدوات من السيرفر ========
async function fetchTools() {
  try {
    const res = await fetch('${SERVER_URL}/api/tools');
    tools = await res.json();
    renderToolsTable();
    updateProfitDisplay();
  } catch (err) {
    console.error(err);
  }
}

// ======== عرض الأدوات ========
function renderToolsTable() {
  const tbody = document.querySelector("#toolsTable tbody");
  tbody.innerHTML = "";

  tools.forEach(t => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${t.name}</td>
      <td>${t.cost.toFixed(2)}</td>
      <td>${t.quantity}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ======== تحديث عرض الربح بعد خصم الأدوات ========
// ======== تحديث عرض الربح بعد خصم الأدوات ========
function updateProfitDisplay() {
  // إجمالي تكلفة الأدوات
  const totalToolsCost = tools.reduce((sum, t) => sum + (t.cost || 0) * (t.quantity || 0), 0);

  // إجمالي الربح من الأوردرات
  const totalProfitOverall = orders.reduce((sum, o) => sum + (o.profit || 0), 0);

  // الربح بعد خصم الأدوات (لو المجموع أقل من صفر نخليه صفر)
  let profitAfterTools = totalProfitOverall - totalToolsCost;
  if (profitAfterTools < 0) profitAfterTools = 0;

  // عرض النتائج
  const profitDisplayEl = document.getElementById("profitDisplay");
  const toolsTotalProfitEl = document.getElementById("toolsTotalProfit");

  if (profitDisplayEl) profitDisplayEl.innerText = profitAfterTools.toFixed(2);
  if (toolsTotalProfitEl)
    toolsTotalProfitEl.textContent = `إجمالي تكلفة الأدوات: ${totalToolsCost.toFixed(2)} جنيه | إجمالي الربح بعد خصم الأدوات: ${profitAfterTools.toFixed(2)} جنيه`;
}

// ======== بعد جلب الأوردرات من السيرفر ========
async function fetchOrders() {
  try {
    const res = await fetch('${SERVER_URL}/api/orders');
    if (!res.ok) throw new Error("خطأ في جلب الأوردرات");
    orders = await res.json();
    updateProfitDisplay(); // ✅ تحديث مباشرة بعد التحميل
  } catch (err) {
    console.error(err);
  }
}

// ======== بعد جلب الأدوات من السيرفر ========
async function fetchTools() {
  try {
    const res = await fetch('${SERVER_URL}/api/tools');
    if (!res.ok) throw new Error("خطأ في جلب الأدوات");
    tools = await res.json();
    renderToolsTable();
    updateProfitDisplay(); // ✅ تحديث مباشرة بعد التحميل
  } catch (err) {
    console.error(err);
  }
}

// ======== بعد إضافة أداة جديدة ========
async function addTool() {
  const name = document.getElementById("toolName").value.trim();
  const cost = parseFloat(document.getElementById("toolCost").value);
  const quantity = parseInt(document.getElementById("toolQty").value);

  if (!name || isNaN(cost) || cost <= 0 || isNaN(quantity) || quantity < 1) {
    return alert("من فضلك أدخل قيم صحيحة");
  }

  try {
    const res = await fetch("${SERVER_URL}/api/tools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, cost, quantity })
    });
    if (!res.ok) throw new Error("خطأ في إضافة الأداة");
    const newTool = await res.json();
    tools.push(newTool);
    renderToolsTable();
    updateProfitDisplay(); // ✅ تحديث بعد الإضافة

    document.getElementById("toolName").value = "";
    document.getElementById("toolCost").value = "";
    document.getElementById("toolQty").value = 1;
  } catch (err) {
    console.error(err);
  }
}


// ======== فتح وغلق البوب اب ========
function openToolsPopup() { document.getElementById("toolsPopup").style.display = "block"; }
function closeToolsPopup() { document.getElementById("toolsPopup").style.display = "none"; }

// ======== عند تحميل الصفحة ========
fetchOrders();
fetchTools();
