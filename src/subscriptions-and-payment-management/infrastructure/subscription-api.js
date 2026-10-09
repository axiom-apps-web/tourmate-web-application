import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

const fallbackApiBaseUrl = import.meta.env.VITE_TOURMATE_PLATFORM_API_URL;
const plansApiBaseUrl = import.meta.env.VITE_PLANS_API_URL || fallbackApiBaseUrl;
const subscriptionsApiBaseUrl = import.meta.env.VITE_SUBSCRIPTIONS_API_URL || fallbackApiBaseUrl;
const paymentsApiBaseUrl = import.meta.env.VITE_PAYMENTS_API_URL || fallbackApiBaseUrl;
const plansEndpointPath         =import.meta.env.VITE_PLANS_ENDPOINT_PATH || '/plans';
const subscriptionsEndpointPath =import.meta.env.VITE_SUBSCRIPTIONS_ENDPOINT_PATH || '/subscriptions';
const paymentsEndpointPath      =import.meta.env.VITE_PAYMENTS_ENDPOINT_PATH || '/payments';

/**
 * API client of the Subscriptions and Payment Management bounded context.
 */
export class SubscriptionApi extends BaseApi {
  #plansEndpoint;
  #subscriptionsEndpoint;
  #paymentsEndpoint;

  constructor() {
    super(plansApiBaseUrl);
    this.#plansEndpoint = new BaseEndpoint(this, plansEndpointPath);
    this.#subscriptionsEndpoint = new BaseEndpoint(
        new BaseApi(subscriptionsApiBaseUrl),
        subscriptionsEndpointPath
    );
    this.#paymentsEndpoint = new BaseEndpoint(new BaseApi(paymentsApiBaseUrl), paymentsEndpointPath);
  }

  getPlans() {
    return this.#plansEndpoint.getAll();
  }

  getSubscriptions() {
    return this.#subscriptionsEndpoint.getAll();
  }

  getPayments() {
    return this.#paymentsEndpoint.getAll();
  }
}
