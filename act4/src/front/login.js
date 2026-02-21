const form = document.getElementById("login");
const msg = document.getElementById("msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "";
  msg.classList.remove("ok", "err");

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      msg.textContent = data.message || "Error de login";
      msg.classList.add("err");
      return;
    }

    // OJO: si tu backend responde token con otro nombre, cámbialo aquí
    const token = data.token;
    if (!token) {
      msg.textContent = "Login OK pero no llegó token. Revisa respuesta del backend.";
      msg.classList.add("err");
      return;
    }

    localStorage.setItem("token", token);

    msg.textContent = "Login exitoso.";
    msg.classList.add("ok");

    setTimeout(() => {
      window.location.href = "/productos.html";
    }, 500);

  } catch (err) {
    msg.textContent = "Error de red o servidor";
    msg.classList.add("err");
  }
});
