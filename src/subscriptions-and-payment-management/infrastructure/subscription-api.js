import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

export class SubscriptionApi {
  constructor() {
    const baseApi = new BaseApi();

    this.plansEndpoint = new BaseEndpoint(baseApi, '/plans');
    this.subscriptionsEndpoint = new BaseEndpoint(
      baseApi,
      '/subscriptions'
    );
    this.paymentsEndpoint = new BaseEndpoint(baseApi, '/payments');
  }

  async getPlans() {
    const response = await this.plansEndpoint.getAll();
    return response.data;
  }

  async getSubscriptions() {
    const response = await this.subscriptionsEndpoint.getAll();
    return response.data;
  }

  async getPayments() {
    const response = await this.paymentsEndpoint.getAll();
    return response.data;
  }
}
