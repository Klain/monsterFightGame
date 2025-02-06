"use client";
import { useState, useEffect } from "react";
import Login from "@/components/Login";
import api from "@/utils/api";

export default function Home() {
  const [token, setToken] = useState<string | null>(typeof window !== "undefined" ? localStorage.getItem("token") : null);
  const [user, setUser] = useState<{ id: number; username: string } | null>(null);
  const [character, setCharacter] = useState<any>(null);
  const [response, setResponse] = useState("");
  const [newCharacter, setNewCharacter] = useState({ name: "", faction: "", class: "", points: 0 });

  const testDebugEndpoint = async (endpoint: string, method: "GET" | "POST" = "GET", data?: any) => {
    try {
        const debugEndpoint = `/debug${endpoint}`;
        const res = method === "GET" ? await api.get(debugEndpoint) : await api.post(debugEndpoint, data);
        setResponse(JSON.stringify(res.data, null, 2));

        // 🔹 Recargar personaje después de una acción en debug
        const updatedCharacter = await api.get("/characters");
        setCharacter(updatedCharacter.data);
    } catch (error) {
        setResponse("Error al consultar el endpoint.");
    }
  };

  // Cargar datos del usuario y personaje
  useEffect(() => {
    if (token) {
      api.get("/auth/check-session")
        .then((res) => setUser(res.data.user))
        .catch(() => setUser(null));

      api.get("/characters")
        .then((res) => {
          console.log("🔍 Respuesta de /characters:", res.data);
          if (res.data && res.data.name) {
            console.log("✅ Personaje detectado:", res.data);
            setCharacter(res.data);
          } else {
            console.warn("⚠️ No se encontró personaje en la respuesta.");
            setCharacter(null);
          }
        })
        .catch(() => setCharacter(null));
    }
  }, [token]);

  // Crear un nuevo personaje y recargar la página
  const createCharacter = async () => {
    if (!newCharacter.name || !newCharacter.faction || !newCharacter.class) {
      setResponse("Por favor, completa todos los campos.");
      return;
    }

    try {
      const res = await api.post("/characters", newCharacter);
      setCharacter(res.data);
      setResponse("Personaje creado con éxito.");
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      setResponse("Error al crear personaje.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setCharacter(null);
  };

  return (
    <div className="flex flex-col items-center p-6">
      {!token ? (
        <Login setToken={setToken} />
      ) : (
        <div className="w-full max-w-lg">
          <h1 className="text-3xl font-bold mb-4">Debugger de Endpoints</h1>

          {user && (
            <div className="bg-gray-800 text-white p-4 rounded shadow-md mb-4">
              <h2 className="text-xl font-semibold">👤 Usuario: {user.username}</h2>
              <p>🆔 ID: {user.id}</p>
            </div>
          )}

          {character ? (
            <div className="bg-gray-700 text-white p-4 rounded shadow-md mb-4">
            <h2 className="text-xl font-semibold">🏆 Personaje: {character.name}</h2>
            <p>🛡️ Facción: {character.faction}</p>
            <p>⚔️ Clase: {character.class}</p>
            <p>📈 Nivel: {character.level}</p>
            <p>💰 Oro: {character.currentGold}</p>
            <p>❤️ Vida: {character.health} / 100</p>
            <p>🗡️ Ataque: {character.attack}</p>
            <p>🛡️ Defensa: {character.defense}</p>
            <p>✨ XP: {character.currentXp} / {character.level * 100}</p>
            <p>🔹 Puntos de mejora: {character.upgrade_points}</p>
          
            {/* 🔥 Barra de progreso visual de XP */}
            <div className="w-full bg-gray-500 rounded-full h-4 mt-2">
              <div 
                className="bg-blue-500 h-4 rounded-full transition-all duration-500" 
                style={{ width: `${(character.currentXp / (character.level * 100)) * 100}%` }}
              />
            </div>
            <div className="bg-gray-800 text-white p-4 rounded shadow-md mb-4">
              <h2 className="text-xl font-semibold">⚙️ Debug: Añadir Puntos de Mejora</h2>
              <input
                type="number"
                placeholder="Cantidad de puntos"
                className="p-2 border rounded w-full mb-2 text-black"
                min="1"
                value={newCharacter.points || ""}
                onChange={(e) => setNewCharacter({ ...newCharacter, points: parseInt(e.target.value) || 0 })}
              />
              <button className="bg-yellow-500 text-white p-2 rounded w-full"
                onClick={() => testDebugEndpoint("/add-upgrade-points", "POST", { points: newCharacter.points })}>
                ➕ Añadir Puntos de Mejora
              </button>
            </div>
          </div>
            
          ) : (
            <div className="bg-gray-700 text-white p-4 rounded shadow-md mb-4">
              <h2 className="text-xl font-semibold">🆕 Crear un Personaje</h2>
              <input
                type="text"
                placeholder="Nombre"
                className="p-2 border rounded w-full mb-2 text-black"
                value={newCharacter.name}
                onChange={(e) => setNewCharacter({ ...newCharacter, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Facción (ej: Vampiros)"
                className="p-2 border rounded w-full mb-2 text-black"
                value={newCharacter.faction}
                onChange={(e) => setNewCharacter({ ...newCharacter, faction: e.target.value })}
              />
              <input
                type="text"
                placeholder="Clase (ej: Guerrero)"
                className="p-2 border rounded w-full mb-2 text-black"
                value={newCharacter.class}
                onChange={(e) => setNewCharacter({ ...newCharacter, class: e.target.value })}
              />
              <button className="bg-green-500 text-white p-2 rounded w-full" onClick={createCharacter}>
                ✅ Crear Personaje
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <button className="bg-blue-500 text-white p-2 rounded" onClick={() => testDebugEndpoint("/add-xp", "POST", { xp: 50 })}>
              🎖️ Ganar 50 XP
            </button>

            <button className="bg-yellow-500 text-white p-2 rounded" onClick={() => testDebugEndpoint("/buy-healing", "POST")}>
              🏥 Comprar Sanación
            </button>

            <button className="bg-purple-500 text-white p-2 rounded" onClick={() => testDebugEndpoint("/regenerate-health", "GET")}>
              ♻️ Regenerar Salud
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4">
            <button className="bg-red-500 text-white p-2 rounded"
              disabled={!character || character.upgrade_points <= 0}
              onClick={() => testDebugEndpoint("/upgrade-attribute", "POST", { attribute: "attack" })}>
              ⚔️ Mejorar Ataque
            </button>
            
            <button className="bg-blue-500 text-white p-2 rounded"
              disabled={!character || character.upgrade_points <= 0}
              onClick={() => testDebugEndpoint("/upgrade-attribute", "POST", { attribute: "defense" })}>
              🛡️ Mejorar Defensa
            </button>
            
            <button className="bg-green-500 text-white p-2 rounded"
              disabled={!character || character.upgrade_points <= 0}
              onClick={() => testDebugEndpoint("/upgrade-attribute", "POST", { attribute: "health" })}>
              ❤️ Mejorar Salud
            </button>
          </div>

          <button className="bg-red-600 text-white p-2 w-full mt-4 rounded" onClick={handleLogout}>
            ❌ Cerrar Sesión
          </button>

          <pre className="bg-gray-800 text-white p-4 mt-4 rounded min-h-[100px] border border-gray-600">
            {response || "Esperando respuesta..."}
          </pre>
        </div>
      )}
    </div>
  );
}
