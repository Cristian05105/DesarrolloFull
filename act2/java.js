
const input = document.getElementById("nueva-tarea");
const boton = document.getElementById("agregar-tarea");
const lista = document.getElementById("lista-tareas");
const error = document.getElementById("mensaje-error");

//  agregar tarea
boton.addEventListener("click", function () {

  error.textContent = ""; 
  const texto = input.value.trim();

  if (texto === "") {
    error.textContent = "No puedes agregar una tarea vacía";
    return;
  }

  // Crear tarea
  const li = document.createElement("li");
  li.className = "tarea";

  const span = document.createElement("span");
  span.className = "texto";
  span.textContent = texto;

  // Botón editar
  const editar = document.createElement("button");
  editar.textContent = "Editar";
  editar.className = "btn btn-editar";

  editar.addEventListener("click", function () {
    const nuevoTexto = prompt("Editar tarea:", span.textContent);

    if (nuevoTexto === null) return;

    if (nuevoTexto.trim() === "") {
      error.textContent = "La tarea no puede quedar vacía";
      return;
    }

    error.textContent = "";
    span.textContent = nuevoTexto.trim();
  });

  // Botón eliminar
  const eliminar = document.createElement("button");
  eliminar.textContent = "Eliminar";
  eliminar.className = "btn btn-eliminar";

  eliminar.addEventListener("click", function () {
    li.remove();
  });

  // Agregar todo
  li.appendChild(span);
  li.appendChild(editar);
  li.appendChild(eliminar);
  lista.appendChild(li);

  // Limpiar input
  input.value = "";
});
