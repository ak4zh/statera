export const billingTypes = {
    fixed: { title: 'Fixed', formula: '(Fixed)' },
    tonne: { title: 'Per Tonne', plural: 'Tonnage', formula: ' (Rate * Total Tonnage)' },
    kg: { title: 'Per Kg', plural: 'Kgs', formula: ' (Rate * Total weight in kg)' },
    km: { title: 'Per Km', plural: 'Kms', formula: ' (Rate * Number of kms)' },
    trip: { title: 'Per Trip', plural: 'Trips', formula: ' (Rate * Number of Trip)' },
    day: { title: 'Per Day', plural: 'Days', formula: ' (Rate * Number of Days)' },
    hour: { title: 'Per Hour', plural: 'Hours', formula: ' (Rate * Number of Litres)' },
    litre: { title: 'Per Litre', plural: 'Litres', formula: ' (Rate * Number of Litres)' },
    bag: { title: 'Per Bag', plural: 'Bags', formula: ' (Rate * Number of Bags)' }
};