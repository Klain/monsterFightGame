import CacheDataService from "./cache/CacheDataService";
import { Character } from "../models/character.model";
import { Message } from "../models/message.model";
import ServerConfig from "../constants/serverConfig";
import { BattleLog } from "../models/battleLog.model";


class CombatService {
  static getOpponentList(character: Character, range: number = 5): Character[] {
    try {
      const range = 5;
      const results = CacheDataService.getAllCharacters().filter(
        opponent=> opponent.level<=(character.level+range) && opponent.level>=(character.level-range)
      );
      const shuffled = results.sort(() => 0.5 - Math.random()).slice(0, 5);
      return shuffled;
    } catch (error) {
      console.error("Error al obtener posibles oponentes:", error);
      throw new Error("Error al buscar posibles oponentes.");
    }
  }
  static async canAttackAgain(attacker: Character, defender: Character): Promise<boolean> {
    try {
      const lastFight = defender.lastFight;
      if (!lastFight) { return true;  }
      const lastAttackTime = new Date(lastFight);
      const now = new Date();

      // Tiempo en minutos desde el último ataque
      const minutesSinceLastAttack = (now.getTime() - lastAttackTime.getTime()) / 60000;
      return minutesSinceLastAttack >= 60;
    } catch (error) {
      console.error("Error al verificar restricción de ataque:", error);
      return false;
    }
  }
  static async handleCombat(attacker: Character, defender: Character): Promise<any> {
    try {
      // Cargar configuración de combate
      const { maxTurns, attackEnergyCost, defendEnergyCost } = ServerConfig.assault;
      const battleLog: string[] = [];
      battleLog.push(`${attacker.name} desafía a ${defender.name}. ¡El combate comienza!`);
      let turn = 1;
      // Combate por turnos
      while (!attacker.isDead() && !defender.isDead() && turn <= maxTurns) {
        if (turn % 2 !== 0) {
          // Turno del atacante
          if (attacker.currentStamina < attackEnergyCost) {
            // Atacante exhausto, no puede atacar
            battleLog.push(`Turno ${turn}: ${attacker.name} está demasiado exhausto para atacar.`);
          } else {
            // Atacante realiza un ataque
            attacker.currentStamina -= attackEnergyCost; // Reducir energía del atacante
            const damage = attacker.calculateDamage(defender);
            defender.currentHealth -= damage;
            battleLog.push(`Turno ${turn}: ${attacker.name} ataca a ${defender.name} y causa ${damage} de daño.`);
          }
        } else {
          // Turno del defensor
          if (defender.currentStamina < defendEnergyCost) {
            // Defensor exhausto, recibe daño completo sin esquivar
            const damage = attacker.strength; // Daño sin evasión ni mitigación
            defender.currentHealth -= damage;
            battleLog.push(`Turno ${turn}: ${defender.name} está demasiado exhausto para esquivar y recibe ${damage} de daño.`);
          } else {
            // Defensor realiza un ataque
            defender.currentStamina -= defendEnergyCost; // Reducir energía del defensor
            const damage = defender.calculateDamage(attacker);
            attacker.currentHealth -= damage;
            battleLog.push(`Turno ${turn}: ${defender.name} contraataca a ${attacker.name} y causa ${damage} de daño.`);
          }
        }
        turn++;
      }
      let winner;
      let loser;
      // Si se alcanzó el máximo de turnos
      if (turn > maxTurns) {
        const attackerHealthPercentage = attacker.getHealthPercentage();
        const defenderHealthPercentage = defender.getHealthPercentage();
  
        if (attackerHealthPercentage > defenderHealthPercentage) {
          battleLog.push(`El combate termina tras alcanzar el máximo de turnos. ${attacker.name} gana por mayor porcentaje de salud (${attackerHealthPercentage.toFixed(2)}% vs ${defenderHealthPercentage.toFixed(2)}%).`);
          winner = attacker;loser = defender;
        } else if (defenderHealthPercentage > attackerHealthPercentage) {
          battleLog.push(`El combate termina tras alcanzar el máximo de turnos. ${defender.name} gana por mayor porcentaje de salud (${defenderHealthPercentage.toFixed(2)}% vs ${attackerHealthPercentage.toFixed(2)}%).`);
          winner = defender;loser = attacker;
        } else {
          battleLog.push("El combate termina en empate tras alcanzar el máximo de turnos con igual porcentaje de salud.");
          winner=loser=null;
        }
      }else{
        winner = attacker.isDead() ? defender : attacker;
        loser = attacker.isDead() ? attacker : defender;
      }
  
      // Recompensas y penalizaciones
      const xpGained = 50 + Math.floor(Math.random() * 50);
      let goldLooted = 0;
      if(winner && loser){
        goldLooted = Math.floor(Math.random() * loser.currentGold);
        winner.currentXp += xpGained*1.2;
        loser.currentXp += xpGained;
        winner.currentGold += goldLooted;
        loser.currentGold -= goldLooted;
      }else{
        attacker.currentXp += xpGained;
        defender.currentXp += xpGained;
      }
      
      // Guardar batalla y enviar mensajes
      await CombatService.saveCombatLog(attacker, defender, winner, goldLooted, xpGained, battleLog);
  
      return {
        message: winner?`${winner.name} ha ganado la batalla.`: 'La batalla acabó en empate',
        battle_log: battleLog,
        xpGained,
        goldLooted,
      };
    } catch (error) {
      console.error("Error en combate:", error);
      throw new Error("Error interno en el combate.");
    }
  }
  static async handleHeist(thief: Character, target: Character): Promise<string[]> {
    const heistLog: string[] = [];
    heistLog.push(`${thief.name} intenta robar a ${target.name}!`);
    if (target.currentGold <= 0) {
      heistLog.push(`${target.name} no tiene oro para robar.`);
      return heistLog;
    }
    const successChance =
      (thief.agility + thief.precision) /
      ((thief.agility + thief.precision) + (target.agility + target.willpower));
    const isSuccessful = Math.random() < successChance;
    let stolenGold = 0;
    if (isSuccessful) {
      // Calcular oro robado
      const maxSteal = Math.min(target.currentGold, 50);
      stolenGold = Math.ceil(Math.random() * maxSteal);
      thief.currentGold += stolenGold;
      target.currentGold -= stolenGold;
      heistLog.push(`${thief.name} ha robado ${stolenGold} de oro a ${target.name}.`);
    } else {
      const retaliationDamage = Math.floor(target.calculateDamage(thief) * 0.5);
      thief.currentHealth-=retaliationDamage;
      heistLog.push(
        `${thief.name} falló en robar a ${target.name}. ${target.name} contraataca y causa ${retaliationDamage} de daño.`
      );
    }
    CombatService.saveCombatLog(
      thief, target,
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
    winner: Character | null,
    goldWon: number,
    xpWon: number,
    battleLog: string[],
    isHeist: boolean = false
  ): Promise<void> {
    try {
      let attackerMessage, defenderMessage;
      // Crear mensajes para atacante y defensor
      if(winner){
        attackerMessage = new Message({
          senderId: attacker.id,
          senderName: attacker.name,
          receiverId: attacker.id, // Se envía a sí mismo
          receiverName: attacker.name,
          subject: isHeist
            ? `¡Intento de robo contra ${ defender.name}: ${winner.id === attacker.id ? "El robo fue un exito" : "Fuiste descubierto durante el robo"}!`
            : `¡Asalto contra ${ defender.name}: ${winner.id === attacker.id ? "victoria" : "derrota"}!`,
          body: `
            Resultado: ${winner.name} ${isHeist ? "salió victorioso en el robo" : "ganó la batalla"}.
            ${isHeist ? `Oro robado/perdido: ${goldWon}` : `Oro ganado/perdido: ${goldWon}`}
            XP ganado: ${xpWon}
            
            Registro:
            ${battleLog.join("\n")}
          `,
        });
        defenderMessage = new Message({
          senderId: attacker.id, 
          senderName: attacker.name,
          receiverId: defender.id,
          receiverName: defender.name,
          subject: isHeist
            ? `¡${attacker.name} ${winner.id === defender.id ? "ha tratado de robarte" : "te ha robado"}!`
            : `¡${attacker.name} ${winner.id === defender.id ? "te asaltó" : "trato de asaltarte y huyo"}!`,
          body: `
            Resultado: ${winner.name} ${isHeist ? "salió victorioso en el robo" : "ganó la batalla"}.
            ${isHeist ? `Oro perdido: ${goldWon}` : `Oro perdido: ${goldWon / 2}`}
            Registro:
            ${battleLog.join("\n")}
          `,
        });
      }else{
        attackerMessage = new Message({
          senderId: attacker.id,
          senderName: attacker.name,
          receiverId: attacker.id,
          receiverName: attacker.name,
          subject: 
             `¡La batalla acabó en tablas!`,
          body: `
            XP ganado: ${xpWon}
            
            Registro:
            ${battleLog.join("\n")}
          `,
        });
        defenderMessage = new Message({
          senderId: attacker.id,
          senderName: attacker.name,
          receiverId: attacker.id,
          receiverName: attacker.name,
          subject: 
             `¡La batalla acabó en tablas!`,
          body: `
            XP ganado: ${xpWon}
            
            Registro:
            ${battleLog.join("\n")}
          `,
        });
      }
      attacker.sendMessage(attackerMessage);
      defender.sendMessage(defenderMessage);
      console.log(`✅ Mensajes enviados a ${attacker.name} y ${defender.name}`);
  
      CacheDataService.createBattleLog(new BattleLog({
        attackerId: attacker.id,
        defenderId: defender.id,
        winnerId: winner?.id??0,
        goldWon: goldWon,
        xpWon: xpWon,
        lastAttack:new Date(),
      }))

      console.log("✅ Registro guardado en la base de datos.");
    } catch (error) {
      console.error("❌ Error al guardar registro:", error);
      throw new Error("Error al guardar el registro.");
    }
  }
}

export default CombatService
