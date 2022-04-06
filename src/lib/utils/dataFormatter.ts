export const priceFormatter = new Intl.NumberFormat('en-IN', {
	style: 'currency',
	currency: 'INR',
	maximumFractionDigits: 2,
	minimumFractionDigits: 0
});

export const dateFormatter = new Intl.DateTimeFormat('en-IN', {
	dateStyle: 'medium'
});
