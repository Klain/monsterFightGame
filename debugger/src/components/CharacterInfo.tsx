// frontend/src/components/CharacterInfo.tsx
export default function CharacterInfo({ character }: { character: any }) {
  return (
    <div className="bg-gray-700 text-white p-4 rounded shadow-md">
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

      {/* 🔥 Barra de progreso de XP */}
      <div className="w-full bg-gray-500 rounded-full h-4 mt-2">
        <div
          className="bg-blue-500 h-4 rounded-full transition-all duration-500"
          style={{ width: `${(character.currentXp / (character.level * 100)) * 100}%` }}
        />
      </div>
    </div>
  );
}
