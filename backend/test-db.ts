//backend\test-db.ts
import { db } from "./src/database"; 

db.serialize(() => {
    console.log("🗑 Eliminando todos los ítems y efectos...");

    db.run("SELECT * FROM items_effects", (err) => {
        if (err) {
            console.error("❌ Error al eliminar efectos:", err.message);
        } else {
            console.log("✅ Efectos eliminados.");
        }
    });

   

    
});
