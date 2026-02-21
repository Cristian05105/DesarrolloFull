const list = document.getElementById("list");
const msg = document.getElementById("msg");
const btnReload = document.getElementById("btnReload");
const btnLogout = document.getElementById("btnLogout");
const form = document.getElementById("productForm");

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
}

function requireTokenOrRedirect() {
  const token = getToken();
  if (!token) window.location.href = "/login.html";
}

function setMsg(text, type) {
  msg.textContent = text || "";
  msg.classList.remove("ok", "err");
  if (type) msg.classList.add(type);
}

async function handleUnauthorized(res) {
  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login.html";
    return true;
  }
  return false;
}

async function loadProducts() {
  list.innerHTML = "<li>Cargando...</li>";

  try {
    const res = await fetch("/api/products", { headers: authHeaders() });
    if (await handleUnauthorized(res)) return;

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      list.innerHTML = `<li>Error: ${data?.message || res.statusText}</li>`;
      return;
    }

    if (!Array.isArray(data)) {
      list.innerHTML = `<li>Respuesta inesperada (no es array). Revisa tu GET /api/products.</li>`;
      return;
    }

    if (data.length === 0) {
      list.innerHTML = "<li>No hay productos</li>";
      return;
    }

    list.innerHTML = "";
    for (const p of data) {
      const id = p._id || p.id;

      const li = document.createElement("li");
      li.style.display = "flex";
      li.style.alignItems = "center";
      li.style.justifyContent = "space-between";
      li.style.gap = "12px";
      li.style.padding = "8px 0";

      const left = document.createElement("div");
      left.textContent = `${p.name} - $${p.price} (id: ${id})`;
      left.style.flex = "1";

      const right = document.createElement("div");
      right.style.display = "flex";
      right.style.gap = "8px";

      const btnEdit = document.createElement("button");
      btnEdit.textContent = "Editar";
      btnEdit.type = "button";
      btnEdit.className = "secondary";
      btnEdit.addEventListener("click", () => openEditPrompt(p));

      const btnDelete = document.createElement("button");
      btnDelete.textContent = "Eliminar";
      btnDelete.type = "button";
      btnDelete.className = "secondary";
      btnDelete.addEventListener("click", () => deleteProduct(id, p.name));

      right.appendChild(btnEdit);
      right.appendChild(btnDelete);

      li.appendChild(left);
      li.appendChild(right);
      list.appendChild(li);
    }
  } catch (err) {
    console.error(err);
    list.innerHTML = "<li>Error de red</li>";
  }
}

async function createProduct(name, price) {
  const res = await fetch("/api/products", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ name, price }),
  });

  if (await handleUnauthorized(res)) return null;

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    setMsg(data?.message || "No se pudo crear", "err");
    return null;
  }
  return data;
}

async function updateProduct(id, payload) {
  const res = await fetch(`/api/products/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (await handleUnauthorized(res)) return null;

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    setMsg(data?.message || "No se pudo actualizar", "err");
    return null;
  }
  return data;
}

async function deleteProduct(id, name) {
  const ok = confirm(`¿Eliminar "${name}"?`);
  if (!ok) return;

  try {
    const res = await fetch(`/api/products/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    if (await handleUnauthorized(res)) return;

    // Muchos APIs devuelven 204 No Content
    if (!res.ok && res.status !== 204) {
      const data = await res.json().catch(() => null);
      setMsg(data?.message || "No se pudo eliminar", "err");
      return;
    }

    setMsg("Producto eliminado", "ok");
    await loadProducts();
  } catch (err) {
    console.error(err);
    setMsg("Error de red", "err");
  }
}

function openEditPrompt(product) {
  const id = product._id || product.id;

  const newName = prompt("Nuevo nombre:", product.name);
  if (newName === null) return; // cancel

  const newPriceStr = prompt("Nuevo precio:", String(product.price));
  if (newPriceStr === null) return;

  const newPrice = Number(newPriceStr);
  if (!newName.trim() || Number.isNaN(newPrice) || newPrice < 0) {
    setMsg("Datos inválidos para actualizar", "err");
    return;
  }

  (async () => {
    const updated = await updateProduct(id, { name: newName.trim(), price: newPrice });
    if (updated) {
      setMsg("Producto actualizado", "ok");
      await loadProducts();
    }
  })();
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  setMsg("");

  const name = document.getElementById("name").value.trim();
  const price = Number(document.getElementById("price").value);

  if (!name || Number.isNaN(price) || price < 0) {
    setMsg("Nombre y precio válidos son requeridos", "err");
    return;
  }

  const created = await createProduct(name, price);
  if (created) {
    setMsg("Producto creado", "ok");
    form.reset();
    await loadProducts();
  }
});

btnReload.addEventListener("click", loadProducts);

btnLogout.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "/login.html";
});

requireTokenOrRedirect();
loadProducts();
