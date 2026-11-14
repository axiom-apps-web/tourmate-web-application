
import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

const fallbackUrl = import.meta.env.VITE_TOURMATE_PLATFORM_API_URL;

const plansUrl = import.meta.env.VITE_PLANS_API_URL || fallbackUrl;
const subscriptionsUrl = import.meta.env.VITE_SUBSCRIPTIONS_API_URL || fallbackUrl;
const paymentsUrl = import.meta.env.VITE_PAYMENTS_API_URL || fallbackUrl;

export class SubscriptionApi extends BaseApi {
  #plansEndpoint;
  #subscriptionsEndpoint;
  #paymentsEndpoint;

  constructor() {
    super(plansUrl);

    this.#plansEndpoint = new BaseEndpoint(this, '/plans');

    this.#subscriptionsEndpoint = new BaseEndpoint(
        new BaseApi(subscriptionsUrl),
        '/subscriptions'
    );

    this.#paymentsEndpoint = new BaseEndpoint(
        new BaseApi(paymentsUrl),
        '/payments'
    );
  }

  getPlans() {
    return this.#plansEndpoint.getAll();
  }

  createPlan(resource) {
    return this.#plansEndpoint.create(resource);
  }

  updatePlan(id, resource) {
    return this.#plansEndpoint.update(id, resource);
  }

  deletePlan(id) {
    return this.#plansEndpoint.delete(id);
  }

  getSubscriptions() {
    return this.#subscriptionsEndpoint.getAll();
  }

  createSubscription(resource) {
    return this.#subscriptionsEndpoint.create(resource);
  }

  updateSubscription(id, resource) {
    return this.#subscriptionsEndpoint.update(id, resource);
  }

  deleteSubscription(id) {
    return this.#subscriptionsEndpoint.delete(id);
  }

  getPayments() {
    return this.#paymentsEndpoint.getAll();
  }

  createPayment(resource) {
    return this.#paymentsEndpoint.create(resource);
  }

  updatePayment(id, resource) {
    return this.#paymentsEndpoint.update(id, resource);
  }

  deletePayment(id) {
    return this.#paymentsEndpoint.delete(id);
  }
}
