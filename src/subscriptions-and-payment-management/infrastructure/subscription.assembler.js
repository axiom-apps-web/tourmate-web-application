import { Plan } from '../domain/model/plan.entity.js';
import { Subscription } from '../domain/model/subscription.entity.js';
import { Payment } from '../domain/model/payment.entity.js';

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
