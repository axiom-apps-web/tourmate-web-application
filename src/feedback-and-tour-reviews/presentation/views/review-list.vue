<script setup>
import { onMounted } from "vue";
import { useI18n } from "vue-i18n";
import PvCarousel from "primevue/carousel";
import useFeedbackStore from "../../application/feedback.store.js";

const { t } = useI18n();
const store = useFeedbackStore();

/** Shows three reviews on desktop, two on tablets and one on phones. */
const responsiveOptions = [
  { breakpoint: '1100px', numVisible: 2, numScroll: 1 },
  { breakpoint: '700px', numVisible: 1, numScroll: 1 }
];

onMounted(() => {
  store.fetchReviews();
});

const formatDate = (value) => {
  if (!value) return '';
  return new Date(value).getFullYear();
};

/** Returns the reviewer name, or a generic label when the user is unknown. */
const userName = (review) => store.getUserName(review.userId) || t('reviews.unknown_user');

/** Returns up to two initials to show inside the avatar circle. */
const initials = (review) => userName(review)
    .split(' ')
    .map(word => word.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
</script>

<template>
  <section class="reviews-page page-shell" aria-labelledby="reviews-title">
    <header class="reviews-header">
      <p class="reviews-eyebrow">{{ t('shell.workspace') }}</p>
      <h1 id="reviews-title" class="page-heading">{{ t('reviews.list_title') }}</h1>
      <p class="page-description">{{ t('reviews.list_subtitle') }}</p>
    </header>

    <p v-if="!store.loaded && !store.errors.length" class="reviews-state" role="status" aria-live="polite">
      <i class="pi pi-spin pi-spinner" aria-hidden="true"></i>
      {{ t('common.loading') }}
    </p>

    <div v-else-if="store.errors.length" class="reviews-state reviews-state--error" role="alert">
      {{ store.errors.map(error => error.message).join(', ') }}
    </div>

    <div v-else-if="!store.reviews.length" class="reviews-empty surface-card">
      <span class="reviews-empty__icon" aria-hidden="true"><i class="pi pi-star"></i></span>
      <h2>{{ t('reviews.empty_title') }}</h2>
      <p>{{ t('reviews.empty_description') }}</p>
    </div>

    <pv-carousel
        v-else
        :value="store.reviews"
        :num-visible="3"
        :num-scroll="1"
        :responsive-options="responsiveOptions"
        :aria-label="t('reviews.list_title')"
        class="reviews-carousel"
    >
      <template #item="{ data }">
        <div class="review-slide">
          <article class="review-card surface-card">
            <span class="review-quote" aria-hidden="true">“</span>
            <div role="img" :aria-label="t('reviews.rating_aria', {rating: data.rating})">
              <pv-rating :model-value="data.rating" readonly/>
            </div>

            <p v-if="data.comment" class="review-comment">{{ data.comment }}</p>
            <p v-else class="review-comment review-comment--empty">{{ t('reviews.no_comment') }}</p>

            <footer class="review-author">
              <span class="review-avatar" aria-hidden="true">{{ initials(data) }}</span>
              <div class="review-author__details">
                <strong>{{ userName(data) }}</strong>
                <span>
                  {{ store.getTourTitle(data.tourId) || t('reviews.unknown_tour') }} · {{ formatDate(data.createdAt) }}
                </span>
              </div>
            </footer>
          </article>
        </div>
      </template>
    </pv-carousel>
  </section>
</template>

<style scoped>
.reviews-page {
  display: grid;
  gap: 1.5rem;
}

.reviews-header {
  margin-bottom: 0.5rem;
}

.reviews-eyebrow {
  margin: 0 0 0.5rem;
  color: var(--tm-green-800);
  font-size: 0.75rem;
  font-weight: 750;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.review-slide {
  height: 100%;
  padding: 0.55rem;
}

.review-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
  min-height: 17rem;
  padding: clamp(1.1rem, 3vw, 1.75rem);
}

.review-quote {
  height: 1.75rem;
  font-family: Georgia, serif;
  font-size: 3.5rem;
  line-height: 1;
  color: var(--tm-green-800);
}

.review-card :deep(.p-rating-icon) {
  color: var(--tm-green-800);
}

.review-comment {
  flex: 1;
  margin: 0;
  color: var(--tm-text);
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.review-comment--empty {
  color: var(--tm-muted);
  font-style: italic;
}

.review-author {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  min-width: 0;
  padding-top: 0.85rem;
  border-top: 1px solid var(--tm-border);
}

.review-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 50%;
  background: var(--tm-action-bg);
  color: #fff;
  font-weight: 700;
}

.review-author__details {
  display: grid;
  min-width: 0;
  gap: 0.2rem;
}

.review-author__details strong {
  color: var(--tm-text);
}

.review-author__details span {
  color: var(--tm-muted);
  font-size: 0.82rem;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.reviews-state,
.reviews-empty {
  display: grid;
  justify-items: center;
  gap: 0.75rem;
  padding: clamp(2rem, 7vw, 4rem) 1rem;
  color: var(--tm-muted);
  text-align: center;
}

.reviews-state {
  display: flex;
  justify-content: center;
}

.reviews-state--error {
  color: var(--tm-danger);
}

.reviews-empty h2,
.reviews-empty p {
  margin: 0;
}

.reviews-empty h2 {
  color: var(--tm-text);
}

.reviews-empty p {
  max-width: 36rem;
  line-height: 1.6;
}

.reviews-empty__icon {
  display: grid;
  width: 3.2rem;
  height: 3.2rem;
  place-items: center;
  border-radius: 1rem;
  background: var(--tm-green-100);
  color: var(--tm-green-900);
  font-size: 1.3rem;
}

.reviews-carousel :deep(.p-carousel-prev-button),
.reviews-carousel :deep(.p-carousel-next-button) {
  color: var(--tm-green-900);
}

.reviews-carousel :deep(.p-carousel-indicator-button) {
  background: var(--tm-border);
}

.reviews-carousel :deep(.p-carousel-indicator-active .p-carousel-indicator-button) {
  background: var(--tm-green-800);
}

@media (max-width: 600px) {
  .review-card {
    min-height: 15rem;
  }
}
</style>