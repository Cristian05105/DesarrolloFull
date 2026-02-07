from flask import Flask, request, jsonify
import jwt
import bcrypt
from functools import wraps
from datetime import datetime, timedelta

app = Flask(__name__)

users = []   
tareas = []  

SECRET_KEY = "clave_secreta"


#Middleware 
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get("Authorization")

        if not auth:
            return jsonify({"error": "Token requerido"}), 401

        token = auth.replace("Bearer ", "")

        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expirado"}), 403
        except jwt.InvalidTokenError:
            return jsonify({"error": "Token inválido"}), 403

        
        request.user = payload  
        return f(*args, **kwargs)

    return decorated


# registro
@app.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"error": "Se requieren 'name', 'email' y 'password'"}), 400

    # Validacion
    if any(u["email"] == email for u in users):
        return jsonify({"error": "El email ya está registrado"}), 409

    password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

    user = {
        "id": len(users) + 1,
        "name": name,
        "email": email,
        "password_hash": password_hash
    }
    users.append(user)

    return jsonify({
        "message": "Usuario registrado correctamente",
        "user": {"id": user["id"], "name": user["name"], "email": user["email"]}
    }), 201


#login
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Se requieren 'email' y 'password'"}), 400

    user = next((u for u in users if u["email"] == email), None)
    if user is None:
        return jsonify({"error": "Credenciales inválidas"}), 401

    if not bcrypt.checkpw(password.encode("utf-8"), user["password_hash"]):
        return jsonify({"error": "Credenciales inválidas"}), 401

    token = jwt.encode(
        {
            "user_id": user["id"],
            "email": user["email"],
            "exp": datetime.utcnow() + timedelta(hours=1)
        },
        SECRET_KEY,
        algorithm="HS256"
    )

    return jsonify({"message": "Login exitoso", "token": token}), 200


# tareas 
@app.route('/tareas', methods=['GET'])
@token_required
def get_tareas():
    user_id = request.user["user_id"]
    mis_tareas = [t for t in tareas if t["user_id"] == user_id]
    return jsonify(mis_tareas), 200

#crear
@app.route('/tareas', methods=['POST'])
@token_required
def create_tarea():
    data = request.get_json(silent=True) or {}
    titulo = data.get("titulo")
    descripcion = data.get("descripcion")

    if not titulo or not descripcion:
        return jsonify({"error": "Se requieren 'titulo' y 'descripcion'"}), 400

    tarea = {
        "id": len(tareas) + 1,
        "titulo": titulo,
        "descripcion": descripcion,
        "user_id": request.user["user_id"]
    }

    tareas.append(tarea)

    return jsonify({"message": "Tarea agregada exitosamente", "tarea": tarea}), 201

#editar
@app.route('/tareas/<int:tarea_id>', methods=['PUT'])
@token_required
def update_tarea(tarea_id):
    data = request.get_json(silent=True) or {}

    titulo = data.get("titulo")
    descripcion = data.get("descripcion")

    if not titulo or not descripcion:
        return jsonify({"error": "Se requieren 'titulo' y 'descripcion'"}), 400

    
    tarea = next(
        (t for t in tareas if t["id"] == tarea_id and t["user_id"] == request.user["user_id"]),
        None
    )

    if tarea is None:
        return jsonify({"error": "Tarea no encontrada"}), 404

    tarea["titulo"] = titulo
    tarea["descripcion"] = descripcion

    return jsonify({"message": "Tarea actualizada", "tarea": tarea}), 200

#eliminar
@app.route('/tareas/<int:tarea_id>', methods=['DELETE'])
@token_required
def delete_tarea(tarea_id):
    tarea = next(
        (t for t in tareas if t["id"] == tarea_id and t["user_id"] == request.user["user_id"]),
        None
    )

    if tarea is None:
        return jsonify({"error": "Tarea no encontrada"}), 404

    tareas.remove(tarea)

    return jsonify({"message": "Tarea eliminada", "tarea": tarea}), 200


if __name__ == "__main__":
    app.run(debug=True)
