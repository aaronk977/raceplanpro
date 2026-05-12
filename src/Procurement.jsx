import React, { useState } from "react";
import { Btn, C } from "./shared";

var SUPPLIERS = [
  {
    id: "tri", name: "TRI Equestrian", logo: "🏪", category: "General Supplies",
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
    id: "connolly", name: "Connolly's RED MILLS", logo: "🌾", category: "Feed & Nutrition",
    catalogue: [
      { id: "rm_14_1", name: "14% Race Mix 20kg", price: 18.50, unit: "bag", sku: "RM-RACE-14" },
      { id: "rm_haf_1", name: "Racehorse Oats 20kg", price: 15.99, unit: "bag", sku: "RM-OATS" },
      { id: "rm_cha_1", name: "Alfalfa Chaff 15kg", price: 12.99, unit: "bag", sku: "RM-CHAFF" },
      { id: "rm_sup_1", name: "Electrolytes 3kg", price: 22.99, unit: "tub", sku: "RM-ELEC" },
      { id: "rm_sup_2", name: "Vitamin E & Selenium supplement", price: 34.99, unit: "tub", sku: "RM-VIT-E" }
    ]
  },
  {
    id: "vet_supply", name: "Vet Supplies Ireland", logo: "🏥", category: "Medical & Veterinary",
    catalogue: [
      { id: "vs_pol_1", name: "Poultice Pads (pack of 10)", price: 12.99, unit: "pack", sku: "VS-POUL" },
      { id: "vs_bnd_1", name: "Vetrap Bandage 7.5cm x 4.5m", price: 3.99, unit: "roll", sku: "VS-VETWRAP" },
      { id: "vs_ice_1", name: "Ice Boot (pair)", price: 49.99, unit: "pair", sku: "VS-ICE" },
      { id: "vs_tub_1", name: "Wound Care Spray 500ml", price: 8.99, unit: "bottle", sku: "VS-WOUND" },
      { id: "vs_sweat_1", name: "Leg Sweat (pair)", price: 24.99, unit: "pair", sku: "VS-SWEAT" }
    ]
  }
];

function Procurement({ user, supabase, orders, setOrders, settings }) {
  var now = new Date();
  var viewState = useState("catalogue");
  var view = viewState[0]; var setView = viewState[1];
  var selSupplierState = useState(null);
  var selSupplier = selSupplierState[0]; var setSelSupplier = selSupplierState[1];
  var cartState = useState([]);
  var cart = cartState[0]; var setCart = cartState[1];
  var requestNotesState = useState("");
  var requestNotes = requestNotesState[0]; var setRequestNotes = requestNotesState[1];
  var searchState = useState("");
  var search = searchState[0]; var setSearch = searchState[1];
  var filterState = useState("all");
  var filterStatus = filterState[0]; var setFilterStatus = filterState[1];
  var toastState = useState(null);
  var toast = toastState[0]; var setToast = toastState[1];

  function showToast(msg, color) {
    setToast({ msg: msg, color: color || C.green });
    setTimeout(function() { setToast(null); }, 3000);
  }

  function addToCart(item, supplierId) {
    setCart(function(prev) {
      var existing = prev.find(function(c) { return c.id === item.id; });
      if (existing) {
        return prev.map(function(c) { return c.id === item.id ? Object.assign({}, c, { qty: c.qty + 1 }) : c; });
      }
      return prev.concat([Object.assign({}, item, { qty: 1, supplierId: supplierId })]);
    });
    showToast(item.name + " added to cart");
  }

  function updateQty(itemId, qty) {
    if (qty < 1) {
      setCart(function(prev) { return prev.filter(function(c) { return c.id !== itemId; }); });
    } else {
      setCart(function(prev) { return prev.map(function(c) { return c.id === itemId ? Object.assign({}, c, { qty: qty }) : c; }); });
    }
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
    setCart([]);
    setRequestNotes("");
    setView("orders");
    showToast("Purchase order submitted for approval");
  }

  function approveOrder(id) {
    setOrders(function(prev) {
      return prev.map(function(o) {
        if (o.id !== id) return o;
        return Object.assign({}, o, { status: "approved", approvedAt: new Date().toISOString() });
      });
    });
    showToast("Order approved — sending to supplier");
  }

  function rejectOrder(id) {
    setOrders(function(prev) {
      return prev.map(function(o) {
        if (o.id !== id) return o;
        return Object.assign({}, o, { status: "rejected", rejectedAt: new Date().toISOString() });
      });
    });
    showToast("Order rejected", C.red);
  }

  function sendToSupplier(order) {
    var supplierEmails = { tri: "orders@triequestrian.ie", connolly: "orders@redmills.ie", vet_supply: "orders@vetsuppliesireland.ie" };
    var supplierNames = { tri: "TRI Equestrian", connolly: "Connolly RED MILLS", vet_supply: "Vet Supplies Ireland" };
    var yardName = (settings && settings.yardName) || "Racing Yard";
    var itemLines = order.items.map(function(item) {
      return "- " + item.name + " (SKU: " + item.sku + ") x" + item.qty + " @ EUR" + item.price + " each";
    }).join("\n");
    var body = "Purchase Order from " + yardName + "\n\nItems:\n" + itemLines + "\n\nTotal: EUR" + order.total.toFixed(2) + (order.notes ? "\n\nNotes: " + order.notes : "");
    var supplierIds = [...new Set(order.items.map(function(i) { return i.supplierId; }))];
    supplierIds.forEach(function(sid) {
      var email = supplierEmails[sid] || "orders@supplier.ie";
      window.open("mailto:" + email + "?subject=" + encodeURIComponent("Purchase Order - " + yardName + " - " + order.id) + "&body=" + encodeURIComponent(body));
    });
    setOrders(function(prev) {
      return prev.map(function(o) { return o.id === order.id ? Object.assign({}, o, { status: "sent", sentAt: new Date().toISOString() }) : o; });
    });
  }

  var cartTotal = cart.reduce(function(sum, item) { return sum + (item.price * item.qty); }, 0);
  var pendingOrders = (orders || []).filter(function(o) { return o.status === "pending_approval"; });

  var filteredOrders = (orders || []).filter(function(o) {
    if (filterStatus === "all") return true;
    return o.status === filterStatus;
  });

  var STATUS_COLOURS = { pending_approval: C.amber, approved: C.blue, sent: C.green, rejected: C.red };
  var STATUS_LABELS = { pending_approval: "Pending Approval", approved: "Approved", sent: "Sent to Supplier", rejected: "Rejected" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Procurement</div>
          <div style={{ fontSize: 13, color: C.textMid, marginTop: 3 }}>Order supplies through integrated suppliers — secretary approves before sending</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {pendingOrders.length > 0 && (
            <div style={{ padding: "5px 12px", background: C.amber + "15", border: "1px solid " + C.amber + "40", borderRadius: 20, fontSize: 12, fontWeight: 700, color: C.amber }}>
              {pendingOrders.length + " awaiting approval"}
            </div>
          )}
          {cart.length > 0 && (
            <div style={{ padding: "5px 12px", background: C.blue + "15", border: "1px solid " + C.blue + "40", borderRadius: 20, fontSize: 12, fontWeight: 700, color: C.blue }}>
              {cart.length + " in cart · EUR" + cartTotal.toFixed(2)}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {["catalogue", "cart", "orders"].map(function(tab) {
          var labels = { catalogue: "Catalogue", cart: "Cart (" + cart.length + ")", orders: "Orders (" + (orders || []).length + ")" };
          return (
            <button key={tab} onClick={function() { setView(tab); }}
              style={{ padding: "8px 18px", borderRadius: 20, border: "1.5px solid " + (view === tab ? C.navy : C.border),
                background: view === tab ? C.navy : C.card, color: view === tab ? "#fff" : C.textMid,
                fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              {labels[tab]}
            </button>
          );
        })}
      </div>

      {view === "catalogue" && (
        <div>
          <input value={search} onChange={function(e) { setSearch(e.target.value); }}
            placeholder="Search catalogue..."
            style={{ width: "100%", padding: "10px 14px", background: C.card, border: "1px solid " + C.border, borderRadius: 10, fontSize: 13, color: C.text, marginBottom: 14 }} />
          {SUPPLIERS.map(function(supplier) {
            var items = supplier.catalogue.filter(function(item) {
              if (!search) return true;
              return item.name.toLowerCase().indexOf(search.toLowerCase()) >= 0 || item.sku.toLowerCase().indexOf(search.toLowerCase()) >= 0;
            });
            if (items.length === 0 && search) return null;
            return (
              <div key={supplier.id} style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, padding: "12px 16px", background: C.navy, borderRadius: 12 }}>
                  <span style={{ fontSize: 24 }}>{supplier.logo}</span>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{supplier.name}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{supplier.category}</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {items.map(function(item) {
                    var inCart = cart.find(function(c) { return c.id === item.id; });
                    return (
                      <div key={item.id} style={{ background: C.card, border: "1px solid " + (inCart ? C.blue : C.border), borderRadius: 10, padding: "12px 14px" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>{item.name}</div>
                        <div style={{ fontSize: 11, color: C.textDim, marginBottom: 6 }}>{item.sku}</div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 15, fontWeight: 800, color: C.navy }}>{"EUR" + item.price}</span>
                          <span style={{ fontSize: 11, color: C.textMid }}>{item.unit}</span>
                        </div>
                        <button onClick={function() { addToCart(item, supplier.id); }}
                          style={{ width: "100%", marginTop: 10, padding: "7px", background: inCart ? C.blue + "15" : C.navy, color: inCart ? C.blue : "#fff", border: inCart ? "1.5px solid " + C.blue : "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                          {inCart ? "In Cart (" + inCart.qty + ")" : "+ Add to Order"}
                        </button>
                      </div>
                    );
                  })}
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
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 8 }}>Cart is empty</div>
              <Btn onClick={function() { setView("catalogue"); }}>Browse Catalogue</Btn>
            </div>
          ) : (
            <div>
              {cart.map(function(item) {
                var supplier = SUPPLIERS.find(function(s) { return s.id === item.supplierId; });
                return (
                  <div key={item.id} style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 10, padding: "12px 16px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: C.textMid }}>{supplier ? supplier.name : ""} · {item.sku}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button onClick={function() { updateQty(item.id, item.qty - 1); }} style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid " + C.border, background: C.cardOff, cursor: "pointer", fontSize: 14, fontWeight: 700 }}>-</button>
                      <span style={{ fontSize: 15, fontWeight: 700, color: C.text, minWidth: 28, textAlign: "center" }}>{item.qty}</span>
                      <button onClick={function() { updateQty(item.id, item.qty + 1); }} style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid " + C.border, background: C.cardOff, cursor: "pointer", fontSize: 14, fontWeight: 700 }}>+</button>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, minWidth: 80, textAlign: "right" }}>{"EUR" + (item.price * item.qty).toFixed(2)}</div>
                  </div>
                );
              })}
              <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 12, padding: "16px 18px", marginTop: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>Total</span>
                  <span style={{ fontSize: 22, fontWeight: 900, color: C.navy }}>{"EUR" + cartTotal.toFixed(2)}</span>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Notes for Secretary (optional)</div>
                  <input type="text" value={requestNotes} onChange={function(e) { setRequestNotes(e.target.value); }}
                    placeholder="e.g. We need these for the new arrivals next week"
                    style={{ width: "100%", padding: "9px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
                </div>
                <div style={{ background: C.amberBg, border: "1px solid " + C.amber + "30", borderRadius: 8, padding: "10px 12px", marginBottom: 14, fontSize: 12, color: C.amber, fontWeight: 600 }}>
                  ⚠️ This order will be sent to the secretary for approval before placing with suppliers
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
            {["all", "pending_approval", "approved", "sent", "rejected"].map(function(s) {
              var labels2 = { all: "All", pending_approval: "Pending", approved: "Approved", sent: "Sent", rejected: "Rejected" };
              return (
                <button key={s} onClick={function() { setFilterStatus(s); }}
                  style={{ padding: "6px 14px", borderRadius: 20, border: "1.5px solid " + (filterStatus === s ? C.navy : C.border),
                    background: filterStatus === s ? C.navy : C.card, color: filterStatus === s ? "#fff" : C.textMid,
                    fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  {labels2[s]}
                </button>
              );
            })}
          </div>
          {filteredOrders.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", border: "1.5px dashed " + C.border, borderRadius: 14, color: C.textMid }}>
              No orders yet
            </div>
          ) : (
            filteredOrders.map(function(order) {
              var sc = STATUS_COLOURS[order.status] || C.textMid;
              var sl = STATUS_LABELS[order.status] || order.status;
              return (
                <div key={order.id} style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 12, padding: "16px 18px", marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontFamily: "monospace", color: C.textMid }}>{order.id}</span>
                        <span style={{ fontSize: 11, padding: "2px 10px", borderRadius: 20, background: sc + "15", color: sc, fontWeight: 700 }}>{sl}</span>
                      </div>
                      <div style={{ fontSize: 12, color: C.textMid }}>
                        {"Requested by " + order.requestedBy + " · " + new Date(order.requestedAt).toLocaleDateString("en-IE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: C.navy }}>{"EUR" + order.total.toFixed(2)}</div>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    {order.items.map(function(item, idx) {
                      return (
                        <div key={idx} style={{ fontSize: 12, color: C.text, padding: "3px 0", borderBottom: "1px solid " + C.cardOff }}>
                          {item.name + " x" + item.qty + " — EUR" + (item.price * item.qty).toFixed(2)}
                        </div>
                      );
                    })}
                  </div>
                  {order.notes && <div style={{ fontSize: 12, color: C.textMid, marginBottom: 10, fontStyle: "italic" }}>{order.notes}</div>}
                  <div style={{ display: "flex", gap: 8 }}>
                    {order.status === "pending_approval" && (
                      <>
                        <Btn variant="green" onClick={function() { approveOrder(order.id); }} style={{ fontSize: 12, padding: "7px 14px", justifyContent: "center" }}>Approve</Btn>
                        <Btn variant="ghost" onClick={function() { rejectOrder(order.id); }} style={{ fontSize: 12, padding: "7px 14px", color: C.red }}>Reject</Btn>
                      </>
                    )}
                    {order.status === "approved" && (
                      <Btn onClick={function() { sendToSupplier(order); }} style={{ fontSize: 12, padding: "7px 14px", justifyContent: "center" }}>Send to Supplier</Btn>
                    )}
                    {order.status === "sent" && (
                      <span style={{ fontSize: 12, color: C.green, fontWeight: 700 }}>✓ Order sent to supplier</span>
                    )}
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
