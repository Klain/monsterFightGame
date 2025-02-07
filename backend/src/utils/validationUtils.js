//backend\src\utils\validationUtils.js

 function validateAttributeExist(attribute) {
    const validAttributes = ["attack", "defense", "health"];

    if (!validAttributes.includes(attribute)) {
        return { success: false, error: "Atributo no válido." };
    }

    return { success: true };
}

module.exports = { validateAttributeExist };