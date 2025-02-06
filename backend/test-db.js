const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database("./data/monsterFight.db");

db.all(`UPDATE characters 
SET currentXP = 3000, totalXP = 3000 
WHERE id = 1;`, [], (err, rows) => {
    if (err) {
        console.error("❌ Error al obtener personajes:", err);
    } else {
        console.log("📋 Personajes en la base de datos:");
        console.table(rows);
    }
    db.close();
});
