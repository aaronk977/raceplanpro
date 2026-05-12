import React, { useState } from "react";
import { Btn, C } from "./shared";

var DEFAULT_SUPPLIERS = [
  {
    id: "tri", name: "TRI Equestrian", email: "orders@triequestrian.ie", phone: "+353 1 234 5678",
    category: "General Supplies", logo: "🏪", active: true,
    catalogue: [
      { id: "tri_rug_1", name: "Medium Weight Turnout Rug 200g", price: 89.99, unit: "each", sku: "TRI-RUG-200" },
      { id: "tri_rug_2", name: "Heavy Weight Turnout Rug 300g", price: 109.99, unit: "each", sku: "TRI-RUG-300" },
      { id: "tri_rug_3", name: "Stable Rug 200g", price: 79.99, unit: "each", sku: "TRI-STAB-200" },
      { id: "tri_ban_1", name: "Fleece Bandages (set of 4)", price: 14.99, unit: "set", sku: "TRI-BAN-FL" },
      { id: "tri_ban_2", name: "Exercise Bandages (set of 4)", price: 19.99, unit: "set", sku: "TRI-BAN-EX" },
      { id: "tri_hal_1", name: "Leather Headcollar", price: 34.99, unit: "each", sku: "TRI-HAL-LTH" },
      { id: "tri_hal_2", name: "Nylon Headcollar", price: 12.99, unit: "each", sku: "TRI-HAL-NYL" },
      { id: "tri_lead_1", name: "Lead Rope", price: 8.99, unit: "each", sku: "TRI-LEAD" },
      { id: "tri_hoof_1", name: "Hoof Oil 500ml", price: 7.99, unit: "bottle", sku: "TRI-HOOF" },
      { id: "tri_brush_1", name: "Grooming Kit (full set)", price: 24.99, unit: "set", sku: "TRI-GROOM" }
    ]
  },
  {
    id: "redmills", name: "Connolly's RED MILLS", email: "orders@redmills.ie", phone: "+353 56 883 1300",
    category: "Feed & Nutrition", logo: "🌾", active: true,
    catalogue: [
      { id: "rm_14_1", name: "14% Race Mix 20kg", price: 18.50, unit: "bag", sku: "RM-RACE-14" },
      { id: "rm_oats_1", name: "Racehorse Oats 20kg", price: 15.99, unit: "bag", sku: "RM-OATS" },
      { id: "rm_chaff_1", name: "Alfalfa Chaff 15kg", price: 12.99, unit: "bag", sku: "RM-CHAFF" },
      { id: "rm_elec_1", name: "Electrolytes 3kg", price: 22.99, unit: "tub", sku: "RM-ELEC" },
      { id: "rm_vite_1", name: "Vitamin E & Selenium supplement", price: 34.99, unit: "tub", sku: "RM-VIT-E" }
    ]
  },
  {
    id: "vsi", name: "Vet Supplies Ireland", email: "orders@vetsuppliesireland.ie", phone: "+353 1 456 7890",
    category: "Medical & Veterinary", logo: "🏥", active: true,
    catalogue: [
      { id: "vs_poul_1", name: "Poultice Pads (pack of 10)", price: 12.99, unit: "pack", sku: "VS-POUL" },
      { id: "vs_vet_1", name: "Vetrap Bandage 7.5cm x 4.5m", price: 3.99, unit: "roll", sku: "VS-VETWRAP" },
      { id: "vs_ice_1", name: "Ice Boot (pair)", price: 49.99, unit: "pair", sku: "VS-ICE" },
      { id: "vs_wound_1", name: "Wound Care Spray 500ml", price: 8.99, unit: "bottle", sku: "VS-WOUND" }
    ]
  }
];

function Procurement({ user, orders, setOrders, settings }) {
  var suppliersState = useState(DEFAULT_SUPPLIERS);
  var suppliers = suppliersState[0]; var setSuppliers = suppliersState[1];
  var viewState = useState("catalogue");
  var view = viewState[0]; var setView = viewState[1];
  var cartState = useState([]);
  var cart = cartState[0]; var setCart = cartState[1];
  var searchState = useState("");
  var search = searchState[0]; var setSearch = searchState[1];
  var requestNotesState = useState("");
  var requestNotes = requestNotesState[0]; var setRequestNotes = requestNotesState[1];
  var filterOrderState = useState("all");
  var filterOrder = filterOrderState[0]; var setFilterOrder = filterOrderState[1];
  var toastState = useState(null);
  var toast = toastState[0]; var setToast = toastState[1];
  var showAddSupplierState = useState(false);
  var showAddSupplier = showAddSupplierState[0]; var setShowAddSupplier = showAddSupplierState[1];
  var editSupplierState = useState(null);
  var editSupplier = editSupplierState[0]; var setEditSupplier = editSupplierState[1];
  var newSupplierState = useState({ name: "", email: "", phone: "", category: "General Supplies", logo: "🏪" });
  var newSupplier = newSupplierState[0]; var setNewSupplier = newSupplierState[1];

  function showToast(msg, color) {
    setToast({ msg: msg, color: color || C.green });
    setTimeout(function() { setToast(null); }, 3000);
  }

  function parseCSV(text, supplierId) {
    var lines = text.split("\n").filter(function(l) { return l.trim(); });
    if (lines.length < 2) return [];
    var sep = lines[0].indexOf("\t") >= 0 ? "\t" : ",";
    var headers = lines[0].split(sep).map(function(h) {
      return h.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_");
    });
    var items = [];
    for (var i = 1; i < lines.length; i++) {
      var cols = lines[i].split(sep).map(function(c) {
        var t = c.trim();
        if (t.length > 1 && t[0] === '"' && t[t.length-1] === '"') return t.slice(1,-1);
        return t;
      });
      if (!cols[0]) continue;
      var row = {};
      for (var j = 0; j < headers.length; j++) { row[headers[j]] = cols[j] || ""; }
      var name = row.name || row.product_name || row.description || cols[0];
      var price = parseFloat(row.price || row.unit_price || row.cost || "0");
      var sku = row.sku || row.product_code || row.code || row.item_code || ("SKU-" + i);
      var unit = row.unit || row.unit_of_measure || row.uom || "each";
      if (name && price > 0) {
        items.push({ id: supplierId + "_csv_" + i + "_" + Date.now(), name: name, price: price, sku: sku, unit: unit });
      }
    }
    return items;
  }

  function handleCatalogueCSV(e, supplierId) {
    var file = e.target.files[0];
    if (!file) return;
    e.target.value = "";
    var reader = new FileReader();
    reader.onload = function(ev) {
      var items = parseCSV(ev.target.result, supplierId);
      if (!items.length) { showToast("No products found — check CSV format", C.red); return; }
      setSuppliers(function(prev) {
        return prev.map(function(s) {
          if (s.id !== supplierId) return s;
          return Object.assign({}, s, { catalogue: items });
        });
      });
      showToast(items.length + " products imported from CSV");
    };
    reader.readAsText(file);
  }

  function addSupplier() {
    if (!newSupplier.name) return;
    var sup = Object.assign({}, newSupplier, { id: "sup_" + Date.now(), active: true, catalogue: [] });
    setSuppliers(function(prev) { return prev.concat([sup]); });
    setNewSupplier({ name: "", email: "", phone: "", category: "General Supplies", logo: "🏪" });
    setShowAddSupplier(false);
    showToast("Supplier added");
  }

  function removeSupplier(id) {
    if (!window.confirm("Remove this supplier?")) return;
    setSuppliers(function(prev) { return prev.filter(function(s) { return s.id !== id; }); });
    showToast("Supplier removed");
  }

  function toggleSupplier(id) {
    setSuppliers(function(prev) {
      return prev.map(function(s) { return s.id === id ? Object.assign({}, s, { active: !s.active }) : s; });
    });
  }

  function addToCart(item, supplierId) {
    setCart(function(prev) {
      var existing = prev.find(function(c) { return c.id === item.id; });
      if (existing) return prev.map(function(c) { return c.id === item.id ? Object.assign({}, c, { qty: c.qty + 1 }) : c; });
      return prev.concat([Object.assign({}, item, { qty: 1, supplierId: supplierId })]);
    });
    showToast(item.name.substring(0, 30) + "... added");
  }

  function updateQty(itemId, qty) {
    if (qty < 1) { setCart(function(prev) { return prev.filter(function(c) { return c.id !== itemId; }); }); }
    else { setCart(function(prev) { return prev.map(function(c) { return c.id === itemId ? Object.assign({}, c, { qty: qty }) : c; }); }); }
  }

  function submitOrder() {
    if (!cart.length) return;
    var order = {
      id: "po_" + Date.now(),
      items: cart.slice(),
      notes: requestNotes,
      status: "pending_approval",
      requestedBy: user ? user.email : "staff",
      requestedAt: new Date().toISOString(),
      total: cart.reduce(function(sum, item) { return sum + (item.price * item.qty); }, 0)
    };
    setOrders(function(prev) { return [order].concat(prev || []); });
    setCart([]); setRequestNotes("");
    setView("orders");
    showToast("Order submitted for approval");
  }

  function approveOrder(id) {
    setOrders(function(prev) { return prev.map(function(o) { return o.id === id ? Object.assign({}, o, { status: "approved", approvedAt: new Date().toISOString() }) : o; }); });
    showToast("Order approved");
  }

  function rejectOrder(id) {
    setOrders(function(prev) { return prev.map(function(o) { return o.id === id ? Object.assign({}, o, { status: "rejected" }) : o; }); });
    showToast("Order rejected", C.red);
  }

  function sendToSupplier(order) {
    var yardName = (settings && settings.yardName) || "Racing Yard";
    var supplierIds = [];
    order.items.forEach(function(item) { if (supplierIds.indexOf(item.supplierId) < 0) supplierIds.push(item.supplierId); });
    supplierIds.forEach(function(sid) {
      var supplier = suppliers.find(function(s) { return s.id === sid; });
      if (!supplier || !supplier.email) return;
      var supplierItems = order.items.filter(function(i) { return i.supplierId === sid; });
      var lines = supplierItems.map(function(item) { return "- " + item.name + " (SKU: " + item.sku + ") x" + item.qty + " @ EUR" + item.price; });
      var subtotal = supplierItems.reduce(function(s, i) { return s + i.price * i.qty; }, 0);
      var body = "Purchase Order from " + yardName + "\nPO Reference: " + order.id + "\n\n" + lines.join("\n") + "\n\nSubtotal: EUR" + subtotal.toFixed(2) + (order.notes ? "\n\nNotes: " + order.notes : "");
      window.open("mailto:" + supplier.email + "?subject=" + encodeURIComponent("Purchase Order - " + yardName + " - " + order.id) + "&body=" + encodeURIComponent(body));
    });
    setOrders(function(prev) { return prev.map(function(o) { return o.id === order.id ? Object.assign({}, o, { status: "sent", sentAt: new Date().toISOString() }) : o; }); });
    showToast("Order emailed to supplier(s)");
  }

  var cartTotal = cart.reduce(function(sum, item) { return sum + (item.price * item.qty); }, 0);
  var activeSuppliers = suppliers.filter(function(s) { return s.active; });
  var pendingOrders = (orders || []).filter(function(o) { return o.status === "pending_approval"; });
  var filteredOrders = (orders || []).filter(function(o) { return filterOrder === "all" || o.status === filterOrder; });
  var STATUS_COLORS = { pending_approval: C.amber, approved: C.blue, sent: C.green, rejected: C.red };
  var STATUS_LABELS = { pending_approval: "Pending Approval", approved: "Approved", sent: "Sent", rejected: "Rejected" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Procurement</div>
          <div style={{ fontSize: 13, color: C.textMid, marginTop: 3 }}>Order supplies — staff request, secretary approves, order goes to supplier</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {pendingOrders.length > 0 && <span style={{ padding: "5px 12px", background: C.amber + "15", border: "1px solid " + C.amber + "40", borderRadius: 20, fontSize: 12, fontWeight: 700, color: C.amber }}>{pendingOrders.length + " pending"}</span>}
          {cart.length > 0 && <span style={{ padding: "5px 12px", background: C.blue + "15", border: "1px solid " + C.blue + "40", borderRadius: 20, fontSize: 12, fontWeight: 700, color: C.blue }}>{cart.length + " in cart"}</span>}
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {[["catalogue","Catalogue"], ["cart","Cart (" + cart.length + ")"], ["suppliers","Suppliers"], ["orders","Orders (" + (orders||[]).length + ")"]].map(function(tab) {
          return (
            <button key={tab[0]} onClick={function() { setView(tab[0]); }}
              style={{ padding: "8px 18px", borderRadius: 20, border: "1.5px solid " + (view === tab[0] ? C.navy : C.border),
                background: view === tab[0] ? C.navy : C.card, color: view === tab[0] ? "#fff" : C.textMid,
                fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              {tab[1]}
            </button>
          );
        })}
      </div>

      {view === "catalogue" && (
        <div>
          <input value={search} onChange={function(e) { setSearch(e.target.value); }}
            placeholder="Search all products..."
            style={{ width: "100%", padding: "10px 14px", background: C.card, border: "1px solid " + C.border, borderRadius: 10, fontSize: 13, color: C.text, marginBottom: 14 }} />
          {activeSuppliers.map(function(supplier) {
            var items = supplier.catalogue.filter(function(item) {
              if (!search) return true;
              return item.name.toLowerCase().indexOf(search.toLowerCase()) >= 0 || (item.sku || "").toLowerCase().indexOf(search.toLowerCase()) >= 0;
            });
            if (items.length === 0 && search) return null;
            return (
              <div key={supplier.id} style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, padding: "12px 16px", background: C.navy, borderRadius: 12 }}>
                  <span style={{ fontSize: 24 }}>{supplier.logo}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{supplier.name}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{supplier.category + " · " + supplier.catalogue.length + " products"}</div>
                  </div>
                  {supplier.catalogue.length === 0 && (
                    <label style={{ padding: "6px 14px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                      Upload CSV
                      <input type="file" accept=".csv,.tsv,.txt" onChange={function(e) { handleCatalogueCSV(e, supplier.id); }} style={{ display: "none" }} />
                    </label>
                  )}
                </div>
                {supplier.catalogue.length === 0 ? (
                  <div style={{ padding: "20px", textAlign: "center", background: C.cardOff, borderRadius: 10, color: C.textMid, fontSize: 13 }}>
                    <div style={{ marginBottom: 10 }}>No products yet. Upload a CSV from {supplier.name}.</div>
                    <div style={{ fontSize: 11, color: C.textDim }}>CSV needs columns: name, price, sku, unit (any order)</div>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {items.map(function(item) {
                      var inCart = cart.find(function(c) { return c.id === item.id; });
                      return (
                        <div key={item.id} style={{ background: C.card, border: "1px solid " + (inCart ? C.blue : C.border), borderRadius: 10, padding: "12px 14px" }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>{item.name}</div>
                          <div style={{ fontSize: 11, color: C.textDim, marginBottom: 6 }}>{item.sku}</div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                            <span style={{ fontSize: 16, fontWeight: 800, color: C.navy }}>{"EUR" + item.price}</span>
                            <span style={{ fontSize: 11, color: C.textMid }}>{item.unit}</span>
                          </div>
                          <button onClick={function() { addToCart(item, supplier.id); }}
                            style={{ width: "100%", padding: "7px", background: inCart ? C.blue + "15" : C.navy, color: inCart ? C.blue : "#fff", border: inCart ? "1.5px solid " + C.blue : "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                            {inCart ? "In Cart (" + inCart.qty + ")" : "+ Add to Order"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {view === "suppliers" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{suppliers.length + " suppliers configured"}</div>
            <Btn onClick={function() { setShowAddSupplier(true); }} style={{ fontSize: 12, padding: "8px 16px" }}>+ Add Supplier</Btn>
          </div>

          {showAddSupplier && (
            <div style={{ background: C.cardOff, border: "1.5px dashed " + C.navy, borderRadius: 12, padding: "16px 18px", marginBottom: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 12 }}>Add Supplier</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                {[
                  { key: "name", label: "Supplier Name", placeholder: "e.g. Horse Power Feeds", full: true },
                  { key: "email", label: "Order Email", placeholder: "orders@supplier.ie" },
                  { key: "phone", label: "Phone", placeholder: "+353 1 000 0000" },
                  { key: "category", label: "Category", placeholder: "e.g. Feed & Nutrition" },
                ].map(function(field) {
                  return (
                    <div key={field.key} style={{ gridColumn: field.full ? "1 / -1" : "auto" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>{field.label}</div>
                      <input type="text" value={newSupplier[field.key] || ""} onChange={function(e) { var v = e.target.value; var k = field.key; setNewSupplier(function(p) { return Object.assign({}, p, { [k]: v }); }); }}
                        placeholder={field.placeholder}
                        style={{ width: "100%", padding: "8px 12px", background: "#fff", border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
                    </div>
                  );
                })}
              </div>
              <div style={{ fontSize: 12, color: C.textMid, marginBottom: 12, padding: "8px 12px", background: C.blueBg, borderRadius: 8 }}>
                After adding, upload their product CSV in the Catalogue tab. Ask your supplier for a CSV with columns: name, sku, price, unit
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn onClick={addSupplier} disabled={!newSupplier.name}>Add Supplier</Btn>
                <Btn variant="ghost" onClick={function() { setShowAddSupplier(false); }}>Cancel</Btn>
              </div>
            </div>
          )}

          {suppliers.map(function(supplier) {
            return (
              <div key={supplier.id} style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 12, padding: "16px 18px", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 28 }}>{supplier.logo}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{supplier.name}</span>
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: supplier.active ? C.green + "15" : C.textDim + "15", color: supplier.active ? C.green : C.textDim, fontWeight: 700 }}>
                        {supplier.active ? "Active" : "Hidden"}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: C.textMid }}>
                      {supplier.category + " · " + supplier.catalogue.length + " products"}
                      {supplier.email && " · " + supplier.email}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <label style={{ padding: "6px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 12, fontWeight: 700, color: C.textMid, cursor: "pointer" }}>
                      Upload CSV
                      <input type="file" accept=".csv,.tsv,.txt" onChange={function(e) { handleCatalogueCSV(e, supplier.id); }} style={{ display: "none" }} />
                    </label>
                    <button onClick={function() { toggleSupplier(supplier.id); }} style={{ padding: "6px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 12, fontWeight: 700, color: C.textMid, cursor: "pointer" }}>
                      {supplier.active ? "Hide" : "Show"}
                    </button>
                    <button onClick={function() { removeSupplier(supplier.id); }} style={{ padding: "6px 12px", background: "none", border: "1px solid " + C.red + "40", borderRadius: 8, fontSize: 12, fontWeight: 700, color: C.red, cursor: "pointer" }}>Remove</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === "cart" && (
        <div>
          {cart.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", border: "1.5px dashed " + C.border, borderRadius: 14, color: C.textMid }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🛒</div>
              <Btn onClick={function() { setView("catalogue"); }}>Browse Catalogue</Btn>
            </div>
          ) : (
            <div>
              {cart.map(function(item) {
                var supplier = suppliers.find(function(s) { return s.id === item.supplierId; });
                return (
                  <div key={item.id} style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 10, padding: "12px 16px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: C.textMid }}>{(supplier ? supplier.name : "") + " · " + item.sku}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button onClick={function() { updateQty(item.id, item.qty - 1); }} style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid " + C.border, background: C.cardOff, cursor: "pointer", fontSize: 16, fontWeight: 700 }}>-</button>
                      <span style={{ fontSize: 15, fontWeight: 700, minWidth: 24, textAlign: "center" }}>{item.qty}</span>
                      <button onClick={function() { updateQty(item.id, item.qty + 1); }} style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid " + C.border, background: C.cardOff, cursor: "pointer", fontSize: 16, fontWeight: 700 }}>+</button>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, minWidth: 80, textAlign: "right" }}>{"EUR" + (item.price * item.qty).toFixed(2)}</div>
                  </div>
                );
              })}
              <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 12, padding: "16px 18px", marginTop: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <span style={{ fontSize: 16, fontWeight: 700 }}>Total</span>
                  <span style={{ fontSize: 22, fontWeight: 900, color: C.navy }}>{"EUR" + cartTotal.toFixed(2)}</span>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase" }}>Notes for Secretary</div>
                  <input type="text" value={requestNotes} onChange={function(e) { setRequestNotes(e.target.value); }}
                    placeholder="e.g. Urgent — needed before Monday"
                    style={{ width: "100%", padding: "9px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
                </div>
                <div style={{ background: C.amberBg, border: "1px solid " + C.amber + "30", borderRadius: 8, padding: "10px 12px", marginBottom: 12, fontSize: 12, color: C.amber, fontWeight: 600 }}>
                  ⚠️ Secretary approval required before order is sent to supplier
                </div>
                <Btn onClick={submitOrder} style={{ width: "100%", justifyContent: "center" }}>Submit for Approval</Btn>
              </div>
            </div>
          )}
        </div>
      )}

      {view === "orders" && (
        <div>
          <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
            {[["all","All"], ["pending_approval","Pending"], ["approved","Approved"], ["sent","Sent"], ["rejected","Rejected"]].map(function(s) {
              return (
                <button key={s[0]} onClick={function() { setFilterOrder(s[0]); }}
                  style={{ padding: "6px 14px", borderRadius: 20, border: "1.5px solid " + (filterOrder === s[0] ? C.navy : C.border),
                    background: filterOrder === s[0] ? C.navy : C.card, color: filterOrder === s[0] ? "#fff" : C.textMid,
                    fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  {s[1]}
                </button>
              );
            })}
          </div>
          {filteredOrders.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", border: "1.5px dashed " + C.border, borderRadius: 14, color: C.textMid }}>No orders yet</div>
          ) : (
            filteredOrders.map(function(order) {
              var sc = STATUS_COLORS[order.status] || C.textMid;
              var sl = STATUS_LABELS[order.status] || order.status;
              return (
                <div key={order.id} style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 12, padding: "16px 18px", marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                        <span style={{ fontSize: 12, fontFamily: "monospace", color: C.textMid }}>{order.id}</span>
                        <span style={{ fontSize: 11, padding: "2px 10px", borderRadius: 20, background: sc + "15", color: sc, fontWeight: 700 }}>{sl}</span>
                      </div>
                      <div style={{ fontSize: 12, color: C.textMid }}>{"By " + order.requestedBy + " · " + new Date(order.requestedAt).toLocaleDateString("en-IE", { day: "numeric", month: "short" })}</div>
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: C.navy }}>{"EUR" + order.total.toFixed(2)}</div>
                  </div>
                  {order.items.map(function(item, idx) {
                    return <div key={idx} style={{ fontSize: 12, color: C.text, padding: "3px 0", borderBottom: "1px solid " + C.cardOff }}>{item.name + " x" + item.qty + " — EUR" + (item.price * item.qty).toFixed(2)}</div>;
                  })}
                  {order.notes && <div style={{ fontSize: 12, color: C.textMid, marginTop: 8, fontStyle: "italic" }}>{order.notes}</div>}
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    {order.status === "pending_approval" && (
                      <React.Fragment>
                        <Btn variant="green" onClick={function() { approveOrder(order.id); }} style={{ fontSize: 12, padding: "7px 14px" }}>Approve</Btn>
                        <Btn variant="ghost" onClick={function() { rejectOrder(order.id); }} style={{ fontSize: 12, padding: "7px 14px", color: C.red }}>Reject</Btn>
                      </React.Fragment>
                    )}
                    {order.status === "approved" && (
                      <Btn onClick={function() { sendToSupplier(order); }} style={{ fontSize: 12, padding: "7px 14px" }}>Send to Supplier</Btn>
                    )}
                    {order.status === "sent" && <span style={{ fontSize: 12, color: C.green, fontWeight: 700 }}>✓ Sent to supplier</span>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: C.navy, padding: "10px 22px", borderRadius: 24, fontSize: 13, fontWeight: 600, zIndex: 999, boxShadow: C.shadowMd }}>
          <span style={{ color: toast.color }}>{toast.msg}</span>
        </div>
      )}
    </div>
  );
}

export default Procurement;
