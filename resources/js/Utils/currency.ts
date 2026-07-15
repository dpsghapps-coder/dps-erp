export const formatCurrency = (amount: number | string) => {
    return `GHS ${parseFloat(amount as string).toLocaleString('en-GH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};
