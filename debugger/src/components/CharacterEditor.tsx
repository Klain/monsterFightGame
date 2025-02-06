// frontend/src/components/CharacterEditor.tsx
"use client";
import { useState } from "react";
import api from "@/utils/api";

interface CharacterEditorProps {
  character: any;
  refreshCharacter: () => void;
}

export default function CharacterEditor({ character, refreshCharacter }: CharacterEditorProps) {
  const [modifications, setModifications] = useState({ field: "", value: 0 });

  const handleModify = async () => {
    if (!modifications.field || modifications.value === 0) {
      alert("Selecciona un campo y un valor válido.");
      return;
    }

    try {
      await api.post("/debug/character/modify", {
        characterId: character.id,
        field: modifications.field,
        value: modifications.value,
      });
      refreshCharacter();
      setModifications({ field: "", value: 0 });
    } catch (error) {
      alert("Error al modificar el personaje.");
    }
  };

  return (
    <div className="bg-gray-800 text-white p-4 rounded shadow-md">
      <h2 className="text-xl font-semibold mb-2">⚙️ Editor de Personaje</h2>

      <label className="block mb-2">Atributo a modificar:</label>
      <select
        className="p-2 w-full text-black rounded mb-2"
        value={modifications.field}
        onChange={(e) => setModifications({ ...modifications, field: e.target.value })}
      >
        <option value="">-- Selecciona --</option>
        <option value="health">❤️ Vida</option>
        <option value="attack">🗡️ Ataque</option>
        <option value="defense">🛡️ Defensa</option>
        <option value="currentGold">💰 Oro</option>
        <option value="totalGold">💰 Oro Total</option>
        <option value="currentXp">✨ XP</option>
        <option value="totalXp">✨ XP Total</option>
        <option value="upgrade_points">🔹 Puntos de mejora</option>
      </select>

      <label className="block mb-2">Cantidad a añadir/restar:</label>
      <input
        type="number"
        className="p-2 w-full text-black rounded mb-2"
        value={modifications.value}
        onChange={(e) => setModifications({ ...modifications, value: parseInt(e.target.value) || 0 })}
      />

      <button className="bg-blue-500 text-white p-2 w-full rounded" onClick={handleModify}>
        🔄 Modificar
      </button>
    </div>
  );
}
