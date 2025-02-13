import { Character } from "../models/character.model";
import DatabaseService from "./databaseService";
import CharacterService from "./characterService";
import { Message } from "../models/message.model";
import { sendMessage } from "./messageService";

class CombatService {

  /**
  * Verifica si un atacante puede atacar a un defensor nuevamente.
  */
  static async canAttackAgain(attacker: Character, defender: Character): Promise<boolean> {
  try {
    const lastAttack = await DatabaseService.get<{ last_attack: string }>(
      `SELECT last_attack FROM battles 
      WHERE attacker_id = ? AND defender_id = ? 
      ORDER BY last_attack DESC LIMIT 1`,
      [attacker.id, defender.id]
    );

    if (!lastAttack) {
      return true; // Si no hay registro previo, puede atacar
    }

    const lastAttackTime = new Date(lastAttack.last_attack);
    const now = new Date();

    // Tiempo en minutos desde el último ataque
    const minutesSinceLastAttack = (now.getTime() - lastAttackTime.getTime()) / 60000;
    return minutesSinceLastAttack >= 60; // Solo puede atacar si ha pasado 1 hora
  } catch (error) {
    console.error("Error al verificar restricción de ataque:", error);
    return false; // Por defecto, prevenir ataques en caso de error
  }
  }
  static async handleCombat(attacker: Character, defender: Character): Promise<any> {
    try {
      let turn = 1;
      const battleLog: string[] = [];
      battleLog.push(`${attacker.name} desafía a ${defender.name}. ¡El combate comienza!`);
  
      // Combate por turnos
      while (!attacker.isDead() && !defender.isDead()) {
        if (turn % 2 !== 0) {
          const damage = attacker.calculateDamage(defender);
          defender.currentHealth -= damage;
          battleLog.push(`Turno ${turn}: ${attacker.name} ataca a ${defender.name} y causa ${damage} de daño.`);
        } else {
          const damage = defender.calculateDamage(attacker);
          attacker.currentHealth -= damage;
          battleLog.push(`Turno ${turn}: ${defender.name} contraataca a ${attacker.name} y causa ${damage} de daño.`);
        }
        turn++;
      }
  
      // Determinar ganador y perdedor
      const winner = attacker.isDead() ? defender : attacker;
      const loser = attacker.isDead() ? attacker : defender;
  
      // Recompensas y penalizaciones
      const xpGained = 50 + Math.floor(Math.random() * 50);
      const goldGained = Math.floor(Math.random() * 20) + 10;
      const lostGold = Math.min(loser.currentGold, goldGained / 2);
  
      await CharacterService.applyCombatRewards(winner, loser, xpGained, goldGained, lostGold);
  
      // Guardar batalla y enviar mensajes
      await CombatService.saveCombatLog(attacker, defender, winner, goldGained, xpGained, battleLog);
  
      return {
        message: `${winner.name} ha ganado la batalla.`,
        battle_log: battleLog,
        xpGained,
        goldGained,
      };
    } catch (error) {
      console.error("Error en combate:", error);
      throw new Error("Error interno en el combate.");
    }
  }
  static async handleHeist(thief: Character, target: Character): Promise<string[]> {
    const heistLog: string[] = [];
    heistLog.push(`${thief.name} intenta robar a ${target.name}!`);
  
    // Verificar si el objetivo tiene oro disponible
    if (target.currentGold <= 0) {
      heistLog.push(`${target.name} no tiene oro para robar.`);
      return heistLog;
    }
  
    // Calcular éxito del robo
    const successChance =
      (thief.agility + thief.precision) /
      ((thief.agility + thief.precision) + (target.agility + target.willpower));
    const isSuccessful = Math.random() < successChance;
    let stolenGold = 0;

    if (isSuccessful) {
      // Calcular oro robado
      const maxSteal = Math.min(target.currentGold, 50); // Máximo oro a robar
      stolenGold = Math.ceil(Math.random() * maxSteal);
  
      // Actualizar oro de ambos personajes
      thief.currentGold += stolenGold;
      target.currentGold -= stolenGold;
  
      // Sincronizar cambios en la base de datos
      await CharacterService.updateCharacterCurrencies(thief);
      await CharacterService.updateCharacterCurrencies(target);
  
      heistLog.push(`${thief.name} ha robado ${stolenGold} de oro a ${target.name}.`);
    } else {
      // Robo fallido, infligir daño al ladrón
      const retaliationDamage = Math.floor(target.calculateDamage(thief) * 0.5);
      thief.receiveDamage(retaliationDamage);
  
      // Sincronizar cambios en la base de datos
      await CharacterService.updateCharacterStatus(thief);
  
      heistLog.push(
        `${thief.name} falló en robar a ${target.name}. ${target.name} contraataca y causa ${retaliationDamage} de daño.`
      );
    }
    await CombatService.saveCombatLog(
      thief,
      target,
      isSuccessful ? thief : target,
      isSuccessful ? stolenGold : 0,
      0,
      heistLog,
      true 
    );
  



    return heistLog;
  }

  static async saveCombatLog(
    attacker: Character,
    defender: Character,
    winner: Character,
    goldWon: number,
    xpWon: number,
    battleLog: string[],
    isHeist: boolean = false
  ): Promise<void> {
    try {
      // Crear mensajes para atacante y defensor
      const attackerMessage = new Message({
        sender_id: attacker.id,
        sender_name: attacker.name,
        receiver_id: attacker.id, // Se envía a sí mismo
        receiver_name: attacker.name,
        subject: isHeist
          ? `¡Intento de robo ${winner.id === attacker.id ? "exitoso" : "fallido"}!`
          : `¡Has ${winner.id === attacker.id ? "ganado" : "perdido"} la batalla!`,
        body: `
          Resultado: ${winner.name} ${isHeist ? "salió victorioso en el robo" : "ganó la batalla"}.
          ${isHeist ? `Oro robado/perdido: ${goldWon}` : `Oro ganado/perdido: ${goldWon}`}
          XP ganado: ${xpWon}
          
          Registro:
          ${battleLog.join("\n")}
        `,
      });
  
      const defenderMessage = new Message({
        sender_id: attacker.id, // El atacante envía la notificación
        sender_name: attacker.name,
        receiver_id: defender.id,
        receiver_name: defender.name,
        subject: isHeist
          ? `¡Has sido ${winner.id === defender.id ? "el héroe" : "robado"}!`
          : `¡Has ${winner.id === defender.id ? "ganado" : "perdido"} la batalla!`,
        body: `
          Resultado: ${winner.name} ${isHeist ? "salió victorioso en el robo" : "ganó la batalla"}.
          ${isHeist ? `Oro perdido: ${goldWon}` : `Oro perdido: ${goldWon / 2}`}
          Registro:
          ${battleLog.join("\n")}
        `,
      });
  
      // Guardar mensajes usando el servicio
      await sendMessage(attackerMessage);
      await sendMessage(defenderMessage);
  
      console.log(`✅ Mensajes enviados a ${attacker.name} y ${defender.name}`);
  
      // Registrar batalla o robo en la base de datos
      await DatabaseService.run(
        `INSERT INTO battles (attacker_id, defender_id, winner_id, gold_won, xp_won) 
         VALUES (?, ?, ?, ?, ?)`,
        [attacker.id, defender.id, winner.id, goldWon, xpWon]
      );
  
      console.log("✅ Registro guardado en la base de datos.");
    } catch (error) {
      console.error("❌ Error al guardar registro:", error);
      throw new Error("Error al guardar el registro.");
    }
  }
}

export default CombatService
