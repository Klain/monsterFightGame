// frontend/src/components/CharacterDebugPanel.tsx
"use client";
import { useState } from "react";
import api from "@/utils/api";

interface CharacterDebugPanelProps {
  character: any;
  refreshCharacter: () => void;
}

export default function CharacterDebugPanel({ character, refreshCharacter }: CharacterDebugPanelProps) {
  const [editedCharacter, setEditedCharacter] = useState({ ...character });

  const handleChange = (field: string, value: string | number) => {
    setEditedCharacter((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveChanges = async (field: string, value: number) => {
    try {
      await api.post("/debug/character/modify", {
        characterId: character.id,
        field,
        value: value - character[field], // Calcular diferencia para sumar/restar
      });
      refreshCharacter();
    } catch (error) {
      alert(`Error al modificar ${field}.`);
    }
  };

  return (
    <div className="bg-gray-800 text-white p-6 rounded shadow-md w-full">
      <h2 className="text-2xl font-semibold mb-4">⚙️ Editor de Personaje (Debug)</h2>

      <div className="grid grid-cols-2 gap-4">
        {/* Nombre */}
        <div>
          <label className="block text-sm">🏆 Nombre</label>
          <input
            type="text"
            className="p-2 w-full text-black rounded"
            value={editedCharacter.name}
            onChange={(e) => handleChange("name", e.target.value)}
            disabled
          />
        </div>

        {/* Clase */}
        <div>
          <label className="block text-sm">⚔️ Clase</label>
          <input
            type="text"
            className="p-2 w-full text-black rounded"
            value={editedCharacter.class}
            onChange={(e) => handleChange("class", e.target.value)}
            disabled
          />
        </div>

        {/* Nivel */}
        <div>
          <label className="block text-sm">📈 Nivel</label>
          <input
            type="number"
            className="p-2 w-full text-black rounded"
            value={editedCharacter.level}
            onChange={(e) => handleChange("level", parseInt(e.target.value))}
          />
          <button className="mt-1 bg-blue-500 text-white p-1 rounded w-full" onClick={() => handleSaveChanges("level", editedCharacter.level)}>
            Guardar
          </button>
        </div>

        {/* Oro */}
        <div>
          <label className="block text-sm">💰 Oro</label>
          <input
            type="number"
            className="p-2 w-full text-black rounded"
            value={editedCharacter.currentGold}
            onChange={(e) => handleChange("currentGold", parseInt(e.target.value))}
          />
          <button className="mt-1 bg-blue-500 text-white p-1 rounded w-full" onClick={() => handleSaveChanges("currentGold", editedCharacter.currentGold)}>
            Guardar
          </button>
        </div>

        {/* Vida */}
        <div>
          <label className="block text-sm">❤️ Vida</label>
          <input
            type="number"
            className="p-2 w-full text-black rounded"
            value={editedCharacter.health}
            onChange={(e) => handleChange("health", parseInt(e.target.value))}
          />
          <button className="mt-1 bg-blue-500 text-white p-1 rounded w-full" onClick={() => handleSaveChanges("health", editedCharacter.health)}>
            Guardar
          </button>
        </div>

        {/* Ataque */}
        <div>
          <label className="block text-sm">🗡️ Ataque</label>
          <input
            type="number"
            className="p-2 w-full text-black rounded"
            value={editedCharacter.attack}
            onChange={(e) => handleChange("attack", parseInt(e.target.value))}
          />
          <button className="mt-1 bg-blue-500 text-white p-1 rounded w-full" onClick={() => handleSaveChanges("attack", editedCharacter.attack)}>
            Guardar
          </button>
        </div>

        {/* Defensa */}
        <div>
          <label className="block text-sm">🛡️ Defensa</label>
          <input
            type="number"
            className="p-2 w-full text-black rounded"
            value={editedCharacter.defense}
            onChange={(e) => handleChange("defense", parseInt(e.target.value))}
          />
          <button className="mt-1 bg-blue-500 text-white p-1 rounded w-full" onClick={() => handleSaveChanges("defense", editedCharacter.defense)}>
            Guardar
          </button>
        </div>

        {/* XP */}
        <div>
          <label className="block text-sm">✨ XP</label>
          <input
            type="number"
            className="p-2 w-full text-black rounded"
            value={editedCharacter.currentXp}
            onChange={(e) => handleChange("currentXp", parseInt(e.target.value))}
          />
          <button className="mt-1 bg-blue-500 text-white p-1 rounded w-full" onClick={() => handleSaveChanges("currentXp", editedCharacter.currentXp)}>
            Guardar
          </button>
        </div>

        {/* Puntos de Mejora */}
        <div>
          <label className="block text-sm">🔹 Puntos de Mejora</label>
          <input
            type="number"
            className="p-2 w-full text-black rounded"
            value={editedCharacter.upgrade_points}
            onChange={(e) => handleChange("upgrade_points", parseInt(e.target.value))}
          />
          <button className="mt-1 bg-blue-500 text-white p-1 rounded w-full" onClick={() => handleSaveChanges("upgrade_points", editedCharacter.upgrade_points)}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
