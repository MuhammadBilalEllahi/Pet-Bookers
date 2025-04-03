/**
 * @param {number} currentPrice
 * @param {number} discount
 * @param {'percent' | 'flat'} discountType
 *
 * @returns {number}
 */
export const calculateDiscountedPrice = (
  currentPrice,
  discount,
  discountType,
) => {
  if (discountType === 'flat') {
    return currentPrice - discount;
  }
  const amountToDeduct = (discount / 100) * currentPrice;
  return currentPrice - amountToDeduct;
};
