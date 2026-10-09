import { Plan } from '../domain/plan.entity.js';
import { Subscription } from '../domain/subscription.entity.js';
import { Payment } from '../domain/payment.entity.js';

export class SubscriptionAssembler {
  static toPlanEntity(resource) {
    return new Plan(resource);
  }

  static toSubscriptionEntity(resource) {
    return new Subscription(resource);
  }

  static toPaymentEntity(resource) {
    return new Payment(resource);
  }

  static toPlanEntities(resources) {
    return resources.map((resource) => this.toPlanEntity(resource));
  }

  static toSubscriptionEntities(resources) {
    return resources.map((resource) =>
      this.toSubscriptionEntity(resource)
    );
  }

  static toPaymentEntities(resources) {
    return resources.map((resource) => this.toPaymentEntity(resource));
  }
}
