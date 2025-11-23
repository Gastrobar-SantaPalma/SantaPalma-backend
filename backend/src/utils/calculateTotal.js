/**
 * Calcula el total de una lista de items.
 * @param {Array<Object>} items - Lista de items con propiedad 'subtotal'.
 * @returns {number} El total calculado.
 */
export const calcularTotal = (items) =>
  items.reduce((total, item) => total + item.subtotal, 0)
