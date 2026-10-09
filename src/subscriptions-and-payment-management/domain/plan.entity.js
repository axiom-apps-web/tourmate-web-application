export class Plan {
  constructor({
    id = null,
    name = '',
    description = '',
    price = 0,
    duration = '',
  } = {}) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.duration = duration;
  }
}
