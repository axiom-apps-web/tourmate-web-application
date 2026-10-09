export class Plan {
  constructor({
    id = null,
    name = '',
    priceAmount = 0,
    priceCurrency = 'USD',
  } = {}) {
    this.id = id;
    this.name = name;
    this.priceAmount = priceAmount;
    this.priceCurrency = priceCurrency;
  }
}
