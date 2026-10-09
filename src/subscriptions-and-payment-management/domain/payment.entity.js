export class Payment {
  constructor({
    id = null,
    agencyId = null,
    planId = null,
    amount = 0,
    currency = 'USD',
    status = '',
    requestedAt = null,
  } = {}) {
    this.id = id;
    this.agencyId = agencyId;
    this.planId = planId;
    this.amount = amount;
    this.currency = currency;
    this.status = status;
    this.requestedAt = requestedAt;
  }
}
