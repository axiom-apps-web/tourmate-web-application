export class Subscription {
  constructor({
    id = null,
    agencyId = null,
    planId = null,
    status = '',
    activatedAt = null,
  } = {}) {
    this.id = id;
    this.agencyId = agencyId;
    this.planId = planId;
    this.status = status;
    this.activatedAt = activatedAt;
  }
}
