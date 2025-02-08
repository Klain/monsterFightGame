//backend\src\utils\validationUtils.js

/**
 * Valida si un atributo existe en la lista de atributos válidos.
 * @param attribute - Atributo a validar
 * @returns Un objeto que indica si el atributo es válido y, en caso contrario, un mensaje de error
 */
export function validateAttributeExist(attribute: string): { success: boolean; error?: string } {
    const validAttributes: string[] = ["attack", "defense", "health"];
  
    if (!validAttributes.includes(attribute)) {
      return { success: false, error: "Atributo no válido." };
    }
  
    return { success: true };
  }
  