"use strict";
//backend\src\utils\validationUtils.js
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAttributeExist = validateAttributeExist;
/**
 * Valida si un atributo existe en la lista de atributos válidos.
 * @param attribute - Atributo a validar
 * @returns Un objeto que indica si el atributo es válido y, en caso contrario, un mensaje de error
 */
function validateAttributeExist(attribute) {
    const validAttributes = ["attack", "defense", "health"];
    if (!validAttributes.includes(attribute)) {
        return { success: false, error: "Atributo no válido." };
    }
    return { success: true };
}
