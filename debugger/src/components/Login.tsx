"use client";
import { useState } from "react";
import api from "@/utils/api";

export default function Login({ setToken }: { setToken: (token: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const response = await api.post("/auth/login", { username, password });
      setToken(response.data.token);
      localStorage.setItem("token", response.data.token);
    } catch (error) {
      setError("Error al iniciar sesión. Verifica tus credenciales.");
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-gray-100 rounded-lg shadow-md w-96">
      <h2 className="text-2xl font-bold mb-4">Iniciar Sesión</h2>
      {error && <p className="text-red-500">{error}</p>}
      <input
        type="text"
        placeholder="Usuario"
        className="p-2 border rounded w-full mb-2"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Contraseña"
        className="p-2 border rounded w-full mb-2"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="bg-blue-500 text-white px-4 py-2 rounded w-full" onClick={handleLogin}>
        Iniciar Sesión
      </button>
    </div>
  );
}
