let cart = JSON.parse(localStorage.getItem("cart")) || [];
let orders = JSON.parse(localStorage.getItem("orders")) || [];

let stockData = JSON.parse(localStorage.getItem("stock")) || {
  "露營帳篷": 3,
  "登山背包": 2,
  "露營爐具": 4,
  "溯溪安全裝備": 1
};

localStorage.setItem("stock", JSON.stringify(stockData));

// ===== 工具 =====
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function getTotalQty() {
  return cart.reduce((sum, i) => sum + i.qty, 0);
}

// ===== Navbar =====
const cartCount = document.getElementById("cart-count");
if (cartCount) cartCount.textContent = getTotalQty();

// ===== 顯示庫存 =====
document.querySelectorAll(".card").forEach(card => {
  const name = card.dataset.name;
  const stockEl = card.querySelector(".stock");
  if (stockEl) stockEl.textContent = stockData[name];
});

// ===== 加入購物車 =====
document.querySelectorAll(".btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const card = btn.closest(".card");
    const name = card.dataset.name;

    let item = cart.find(i => i.name === name);
    let stock = stockData[name];

    if (item) {
      if (item.qty >= stock) return alert("超過庫存");
      item.qty++;
    } else {
      cart.push({ name, qty: 1 });
    }

    saveCart();
    if (cartCount) cartCount.textContent = getTotalQty();
  });
});

// ===== 分類 =====
function filter(type) {
  document.querySelectorAll(".card").forEach(card => {
    card.style.display =
      type === "all" || card.dataset.category === type ? "block" : "none";
  });
}
window.filter = filter;

// ===== cart頁 =====
const list = document.getElementById("cart-list");

if (list) renderCart();

function renderCart() {
  list.innerHTML = "";

  cart.forEach(item => {
    const li = document.createElement("li");

    li.innerHTML = `
      ${item.name}
      <button onclick="changeQty('${item.name}', -1)">-</button>
      ${item.qty}
      <button onclick="changeQty('${item.name}', 1)">+</button>
    `;

    list.appendChild(li);
  });
}

function changeQty(name, change) {
  let item = cart.find(i => i.name === name);
  let stock = stockData[name];

  if (change > 0 && item.qty >= stock) return alert("超過庫存");

  item.qty += change;

  if (item.qty <= 0) {
    cart = cart.filter(i => i.name !== name);
  }

  saveCart();
  renderCart();
  if (cartCount) cartCount.textContent = getTotalQty();
}
window.changeQty = changeQty;

// ===== 送出預約 =====
function submitOrder() {
  const name = document.querySelector("input[placeholder='姓名']").value;
  const phone = document.querySelector("input[placeholder='電話']").value;
  const date = document.querySelector("input[type='date']").value;

  if (!name || !phone || !date) return alert("請填寫完整");

  orders.push({ name, phone, date, items: cart });

  // 扣庫存
  cart.forEach(item => {
    stockData[item.name] -= item.qty;
  });

  localStorage.setItem("orders", JSON.stringify(orders));
  localStorage.setItem("stock", JSON.stringify(stockData));

  cart = [];
  saveCart();

  alert("預約成功");
  location.href = "index.html";
}
window.submitOrder = submitOrder;

// ===== 後台 =====
const admin = document.getElementById("orders");

if (admin) {
  orders.forEach(o => {
    const div = document.createElement("div");

    div.innerHTML = `
      <p>${o.name} / ${o.phone}</p>
      <p>${o.date}</p>
      <p>${o.items.map(i => i.name + " x" + i.qty).join(", ")}</p>
      <hr>
    `;

    admin.appendChild(div);
  });
}