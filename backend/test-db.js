const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database("./data/monsterFight.db");

db.serialize(() => {
    console.log("📦 Populando mensajes en la base de datos...");

    // Insertar múltiples mensajes para probar paginación y ambos usuarios
    const insertMessagesQuery = `
        INSERT INTO messages (sender_id, sender_name, receiver_id, receiver_name, subject, body, timestamp, read)
        VALUES
        (1, 'WarriorOne', 2, 'MageTwo', 'Welcome!', 'Hello MageTwo, welcome to the game!', datetime('now', '-1 day'), 1),
        (1, 'WarriorOne', 2, 'MageTwo', 'Strategy', 'Let''s plan our next strategy!', datetime('now', '-2 day'), 0),
        (1, 'WarriorOne', 2, 'MageTwo', 'Training Tips', 'Here are some tips for training.', datetime('now', '-3 day'), 0),
        (2, 'MageTwo', 1, 'WarriorOne', 'Re: Welcome!', 'Thanks for the warm welcome!', datetime('now', '-4 day'), 1),
        (2, 'MageTwo', 1, 'WarriorOne', 'Re: Strategy', 'Sure, let''s discuss that soon.', datetime('now', '-5 day'), 0),
        (2, 'MageTwo', 1, 'WarriorOne', 'Magic Advice', 'Use magic wisely in battle.', datetime('now', '-6 day'), 1),
        (1, 'WarriorOne', 2, 'MageTwo', 'Quest Info', 'Here is the information for the next quest.', datetime('now', '-7 day'), 0),
        (2, 'MageTwo', 1, 'WarriorOne', 'Re: Quest Info', 'Got it, thanks for the info!', datetime('now', '-8 day'), 1),
        (1, 'WarriorOne', 2, 'MageTwo', 'Battle Recap', 'Good job in the last battle!', datetime('now', '-9 day'), 1),
        (2, 'MageTwo', 1, 'WarriorOne', 'Re: Battle Recap', 'It was a tough one, but we made it!', datetime('now', '-10 day'), 0)
    `;

    db.run(insertMessagesQuery, [], (err) => {
        if (err) {
            console.error("❌ Error al insertar mensajes:", err.message);
        } else {
            console.log("✅ Mensajes insertados con éxito.");
        }
    });
});

// Cerrar la conexión al finalizar
db.close((err) => {
    if (err) {
        console.error("❌ Error al cerrar la conexión con la base de datos:", err.message);
    } else {
        console.log("🔒 Conexión con la base de datos cerrada.");
    }
});
