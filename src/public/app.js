const API = { tables: '/api/tables', products: '/api/products' };
const state = { tables: [], products: [], filter: 'all', query: '', language: localStorage.getItem('vku-language') || 'vi' };
const $ = (selector) => document.querySelector(selector);
const tr = (vi, en) => state.language === 'vi' ? vi : en;
const money = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(value) || 0);
const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

async function request(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers } });
  const text = await response.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!response.ok) throw new Error(data?.message || `Yêu cầu thất bại (${response.status})`);
  return data;
}
function notify(message, type = 'success') {
  const box = $('#notice'); box.textContent = message; box.className = `notice show ${type}`;
  clearTimeout(notify.timer); notify.timer = setTimeout(() => { box.className = 'notice'; }, 3500);
}
function applyLanguage() {
  const en = state.language === 'en';
  document.documentElement.lang = state.language;
  $('#language-toggle').textContent = en ? 'VI' : 'EN';
  const texts = [
    ['.nav-label', 'TỔNG QUAN', 'OVERVIEW'], ['.nav-item[href="#tables"]', 'Bàn ăn', 'Tables'], ['.nav-item[href="#products"]', 'Thực đơn', 'Menu'],
    ['.sidebar-bottom span:nth-child(2)', 'Quản lý<small>Quản trị viên</small>', 'Manager<small>Administrator</small>'],
    ['.topbar .eyebrow', 'KHÔNG GIAN LÀM VIỆC', 'WORKSPACE'], ['.live', '<i></i> Đang hoạt động', '<i></i> Open'],
    ['.stat-card:nth-child(1) p', 'Tổng số bàn', 'Total tables'], ['.stat-card:nth-child(1) .stat-note', 'Bàn phục vụ', 'Dining tables'],
    ['.stat-card:nth-child(2) p', 'Bàn trống', 'Available tables'], ['.stat-card:nth-child(2) .stat-note', 'Sẵn sàng đón khách', 'Ready for guests'],
    ['.stat-card:nth-child(3) p', 'Món trong thực đơn', 'Menu items'], ['.stat-card:nth-child(3) .stat-note', 'Đang kinh doanh', 'Currently offered'],
    ['#tables .section-head .eyebrow', 'SẮP XẾP KHÔNG GIAN', 'DINING AREA'], ['#tables h2', 'Danh sách bàn', 'Tables'], ['#tables .subtext', 'Theo dõi tình trạng và phục vụ từng bàn.', 'Track table availability and service.'], ['#add-table', '＋ Thêm bàn', '＋ Add table'],
    ['[data-filter="all"]', 'Tất cả', 'All'], ['[data-filter="free"]', 'Bàn trống', 'Available'], ['[data-filter="busy"]', 'Đang phục vụ', 'Occupied'], ['#refresh', '↻', '↻'],
    ['#products .section-head .eyebrow', 'DANH MỤC MÓN', 'MENU'], ['#products h2', 'Thực đơn', 'Menu'], ['#products .subtext', 'Quản lý tên món, kích cỡ và giá bán.', 'Manage item names, sizes, and prices.'], ['#add-product', '＋ Thêm món', '＋ Add item'], ['#search', '', ''],
    ['#products thead th:nth-child(1)', 'TÊN MÓN', 'ITEM'], ['#products thead th:nth-child(2)', 'MÔ TẢ', 'DESCRIPTION'], ['#products thead th:nth-child(3)', 'KÍCH CỠ', 'SIZE'], ['#products thead th:nth-child(4)', 'GIÁ BÁN', 'PRICE'],
    ['footer', 'Không gian quản lý <span>•</span> VKU Coffee Shop', 'Management workspace <span>•</span> VKU Coffee Shop'],
    ['#table-form .dialog-head .eyebrow', 'THÔNG TIN BÀN', 'TABLE DETAILS'], ['#product-form .dialog-head .eyebrow', 'THÔNG TIN MÓN', 'ITEM DETAILS'], ['#order-form .dialog-head .eyebrow', 'PHỤC VỤ', 'SERVICE'],
    ['#items-dialog .dialog-head .eyebrow', 'MÓN ĐÃ GỌI', 'ORDERED ITEMS'], ['#items-title', 'Các món đang phục vụ', 'Items being served'],
  ];
  for (const [selector, vi, english] of texts) {
    const node = $(selector);
    if (!node) continue;
    const value = en ? english : vi;
    if (selector.startsWith('.nav-item[')) node.lastChild.textContent = ` ${value}`;
    else if (selector.startsWith('[data-filter=')) node.firstChild.textContent = `${value} `;
    else if (selector === '.live') node.lastChild.textContent = ` ${en ? 'Open' : 'Đang hoạt động'}`;
    else node.innerHTML = value;
  }
  $('#search').placeholder = tr('Tìm món ăn…', 'Search menu…');
  $('#table-form input[name="name"]').placeholder = tr('Ví dụ: Bàn 01', 'Example: Table 01');
  $('#product-form input[name="name"]').placeholder = tr('Ví dụ: Cà phê sữa', 'Example: Milk coffee');
  $('#product-form textarea[name="description"]').placeholder = tr('Mô tả ngắn về món', 'Brief description of the item');
  $('#table-form > label:nth-of-type(1)').childNodes[0].textContent = tr('Tên bàn', 'Table name');
  $('#table-form > label:nth-of-type(2)').childNodes[0].textContent = tr('Sức chứa (người)', 'Capacity (people)');
  $('#product-form > label:nth-of-type(1)').childNodes[0].textContent = tr('Tên món', 'Item name');
  $('#product-form > label:nth-of-type(2)').childNodes[0].textContent = tr('Mô tả', 'Description');
  $('#product-form .form-row label:nth-child(1)').childNodes[0].textContent = tr('Giá bán (₫)', 'Price (₫)');
  $('#product-form .form-row label:nth-child(2)').childNodes[0].textContent = tr('Kích cỡ', 'Size');
  document.querySelectorAll('dialog .close').forEach((button) => button.setAttribute('aria-label', tr('Đóng', 'Close')));
  document.querySelectorAll('.secondary').forEach((button) => button.textContent = tr('Huỷ', 'Cancel'));
  $('#save-table').textContent = tr('Lưu bàn', 'Save table'); $('#save-product').textContent = tr('Lưu món', 'Save item');
  $('#save-order').textContent = tr('Thêm món đã chọn', 'Add selected items');
  $('.order-help').textContent = tr('Chọn một hoặc nhiều món để thêm vào bàn.', 'Choose one or more items to add to this table.');
  $('#today').textContent = new Intl.DateTimeFormat(en ? 'en-US' : 'vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
  renderTables(); renderProducts();
}
function tableId(table) { return table.id; }
function isFree(table) { return Boolean(table.is_available); }
function renderTables() {
  const list = state.tables.filter((table) => state.filter === 'all' || (state.filter === 'free' ? isFree(table) : !isFree(table)));
  $('#count-all').textContent = state.tables.length;
  $('#count-free').textContent = state.tables.filter(isFree).length;
  $('#count-busy').textContent = state.tables.filter((table) => !isFree(table)).length;
  $('#stat-total').textContent = state.tables.length;
  $('#stat-free').textContent = state.tables.filter(isFree).length;
  $('#table-grid').innerHTML = list.length ? list.map((table) => `<article class="table-card ${isFree(table) ? '' : 'busy'}">
    <div class="card-top"><span class="table-symbol">▦</span><span class="status">${isFree(table) ? tr('● Trống', '● Available') : tr('● Đang phục vụ', '● Occupied')}</span></div>
    <h3>${escapeHtml(table.table_name)}</h3><span class="capacity">♧ ${Number(table.table_size) || 0} ${tr('chỗ ngồi', 'seats')}</span>
    <div class="card-actions">${isFree(table) ? `<button class="small-btn" data-action="order" data-id="${tableId(table)}">＋ ${tr('Gọi món', 'Order')}</button>` : `<button class="small-btn" data-action="items" data-id="${tableId(table)}">${tr('Xem món', 'View items')}</button><button class="small-btn" data-action="free" data-id="${tableId(table)}">${tr('Hoàn tất', 'Complete')}</button>`}<button class="small-btn" data-action="edit-table" data-id="${tableId(table)}">${tr('Sửa', 'Edit')}</button><button class="small-btn danger" data-action="delete-table" data-id="${tableId(table)}">${tr('Xoá', 'Delete')}</button></div>
  </article>`).join('') : `<div class="empty">${tr('Chưa có bàn trong mục này.', 'No tables in this view.')}</div>`;
}
function renderProducts() {
  const query = state.query.trim().toLocaleLowerCase('vi');
  const products = state.products.filter((product) => `${product.product_name} ${product.product_description || ''}`.toLocaleLowerCase('vi').includes(query));
  $('#stat-products').textContent = state.products.length;
  $('#product-count').textContent = `${products.length} ${tr('món', 'items')}`;
  $('#product-list').innerHTML = products.length ? products.map((product) => `<tr><td>${escapeHtml(product.product_name)}</td><td>${escapeHtml(product.product_description || '—')}</td><td><span class="size-pill">${escapeHtml(product.product_size)}</span></td><td class="price">${money(product.product_price)}</td><td class="actions"><button class="small-btn" data-action="edit-product" data-id="${product.id}">${tr('Sửa', 'Edit')}</button><button class="small-btn danger" data-action="delete-product" data-id="${product.id}">${tr('Xoá', 'Delete')}</button></td></tr>`).join('') : `<tr><td colspan="5" class="empty">${tr('Không tìm thấy món phù hợp.', 'No matching menu items.')}</td></tr>`;
}
async function loadAll() {
  try {
    const [tables, products] = await Promise.all([request(API.tables), request(API.products)]);
    state.tables = Array.isArray(tables) ? tables : []; state.products = Array.isArray(products) ? products : [];
    renderTables(); renderProducts();
  } catch (error) {
    $('#table-grid').innerHTML = `<div class="empty">${tr('Không tải được dữ liệu. Kiểm tra kết nối máy chủ và cơ sở dữ liệu, sau đó thử tải lại.', 'Could not load data. Check the server and database connection, then try again.')}</div>`;
    $('#product-list').innerHTML = `<tr><td colspan="5" class="empty">${tr('Không tải được thực đơn.', 'Could not load the menu.')}</td></tr>`;
    notify(error.message, 'error');
  }
}
function openTable(table) {
  const form = $('#table-form'); form.reset(); form.elements.id.value = table?.id || '';
  form.elements.name.value = table?.table_name || ''; form.elements.size.value = table?.table_size || 4;
  $('#table-dialog-title').textContent = table ? tr('Cập nhật bàn', 'Edit table') : tr('Thêm bàn mới', 'Add table'); $('#table-dialog').showModal();
}
function openProduct(product) {
  const form = $('#product-form'); form.reset(); form.elements.id.value = product?.id || '';
  form.elements.name.value = product?.product_name || ''; form.elements.description.value = product?.product_description || '';
  form.elements.price.value = product?.product_price ?? ''; form.elements.size.value = product?.product_size || 'M';
  $('#product-dialog-title').textContent = product ? tr('Cập nhật món', 'Edit item') : tr('Thêm món mới', 'Add menu item'); $('#product-dialog').showModal();
}
function openOrder(table) {
  $('#order-title').textContent = `${tr('Gọi món', 'Add order')} · ${table.table_name}`; $('#order-form').elements.tableId.value = table.id;
  $('#order-products').innerHTML = state.products.length ? state.products.map((product) => `<label class="order-product"><input type="checkbox" value="${product.id}"><span>${escapeHtml(product.product_name)} · ${escapeHtml(product.product_size)}</span><b>${money(product.product_price)}</b></label>`).join('') : '<p class="muted">Chưa có món trong thực đơn.</p>';
  $('#order-dialog').showModal();
}
async function openItems(table) {
  $('#items-title').textContent = `${tr('Các món đang phục vụ', 'Items being served')} · ${table.table_name}`;
  $('#items-list').innerHTML = `<div class="loading">${tr('Đang tải món…', 'Loading items…')}</div>`;
  $('#items-dialog').showModal();
  await loadTableItems(table);
}
async function loadTableItems(table) {
  const items = await request(`${API.tables}/item/${table.id}`);
  $('#items-list').innerHTML = items.length ? items.map((item) => `<div class="ordered-item"><div class="ordered-item-info"><strong>${escapeHtml(item.product_name)}</strong><span>${tr('Kích cỡ', 'Size')} ${escapeHtml(item.product_size)}</span></div><span class="price">${money(item.product_price)}</span><button class="small-btn danger" data-action="remove-item" data-id="${table.id}" data-product-id="${item.id}">${tr('Bỏ món', 'Remove')}</button></div>`).join('') : `<div class="ordered-empty">${tr('Bàn này chưa có món nào được gọi.', 'No items have been ordered for this table.')}</div>`;
}
document.addEventListener('click', async (event) => {
  const filter = event.target.closest('[data-filter]');
  if (filter) { state.filter = filter.dataset.filter; document.querySelectorAll('.filter').forEach((button) => button.classList.toggle('active', button === filter)); renderTables(); return; }
  const action = event.target.closest('[data-action]');
  if (!action) return;
  const id = Number(action.dataset.id), table = state.tables.find((item) => Number(item.id) === id), product = state.products.find((item) => Number(item.id) === id);
  try {
    switch (action.dataset.action) {
      case 'order': openOrder(table); break;
      case 'items': await openItems(table); break;
      case 'remove-item': {
        await request(`${API.tables}/item/`, { method: 'DELETE', body: JSON.stringify({ table_id: id, product_id: Number(action.dataset.productId) }) });
        notify(tr('Đã bỏ món khỏi bàn.', 'Item removed from table.'));
        await loadTableItems(table); await loadAll(); break;
      }
      case 'edit-table': openTable(table); break;
      case 'edit-product': openProduct(product); break;
      case 'free': await request(`${API.tables}/mark/${id}`, { method: 'PATCH' }); notify('Đã cập nhật bàn sẵn sàng.'); await loadAll(); break;
      case 'delete-table': if (confirm(`Xoá ${table.table_name}?`)) { await request(`${API.tables}/${id}`, { method: 'DELETE' }); notify('Đã xoá bàn.'); await loadAll(); } break;
      case 'delete-product': if (confirm(`Xoá món “${product.product_name}”?`)) { await request(`${API.products}/${id}`, { method: 'DELETE' }); notify('Đã xoá món.'); await loadAll(); } break;
    }
  } catch (error) { notify(error.message, 'error'); }
});
$('#add-table').addEventListener('click', () => openTable());
$('#add-product').addEventListener('click', () => openProduct());
$('#refresh').addEventListener('click', loadAll);
$('#language-toggle').addEventListener('click', () => {
  state.language = state.language === 'vi' ? 'en' : 'vi';
  localStorage.setItem('vku-language', state.language);
  applyLanguage();
});
$('#close-items').addEventListener('click', () => $('#items-dialog').close());
$('#done-items').addEventListener('click', () => $('#items-dialog').close());
$('#search').addEventListener('input', (event) => { state.query = event.target.value; renderProducts(); });
$('#table-form').addEventListener('submit', async (event) => {
  if (event.submitter?.value === 'cancel') return;
  event.preventDefault(); const form = event.currentTarget, id = form.elements.id.value;
  try {
    await request(id ? `${API.tables}/${id}` : API.tables, { method: id ? 'PUT' : 'POST', body: JSON.stringify({ name: form.elements.name.value.trim(), size: Number(form.elements.size.value) }) });
    $('#table-dialog').close(); notify(id ? 'Đã cập nhật bàn.' : 'Đã thêm bàn.'); await loadAll();
  } catch (error) { notify(error.message, 'error'); }
});
$('#product-form').addEventListener('submit', async (event) => {
  if (event.submitter?.value === 'cancel') return;
  event.preventDefault(); const form = event.currentTarget, id = form.elements.id.value;
  try {
    await request(id ? `${API.products}/${id}` : API.products, { method: id ? 'PUT' : 'POST', body: JSON.stringify({ name: form.elements.name.value.trim(), description: form.elements.description.value.trim(), price: Number(form.elements.price.value), size: form.elements.size.value }) });
    $('#product-dialog').close(); notify(id ? 'Đã cập nhật món.' : 'Đã thêm món.'); await loadAll();
  } catch (error) { notify(error.message, 'error'); }
});
$('#order-form').addEventListener('submit', async (event) => {
  if (event.submitter?.value === 'cancel') return;
  event.preventDefault(); const tableId = Number(event.currentTarget.elements.tableId.value);
  const productIds = [...document.querySelectorAll('#order-products input:checked')].map((input) => Number(input.value));
  if (!productIds.length) { notify('Hãy chọn ít nhất một món.', 'error'); return; }
  try {
    await request(`${API.tables}/items/`, { method: 'POST', body: JSON.stringify({ table_id: tableId, product_ids: productIds }) });
    await request(`${API.tables}/unmark/${tableId}`, { method: 'PATCH' });
    $('#order-dialog').close(); notify('Đã thêm món và cập nhật trạng thái bàn.'); await loadAll();
  } catch (error) { notify(error.message, 'error'); }
});
applyLanguage();
loadAll();
