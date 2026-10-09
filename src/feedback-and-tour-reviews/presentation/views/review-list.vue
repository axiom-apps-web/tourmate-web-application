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
  <section class="p-4 md:p-5 pb-8">
    <div class="mt-4 mb-4">
      <h1 class="text-3xl font-bold text-color m-0">{{ t('reviews.list_title') }}</h1>
      <p class="m-0 mt-2 text-color-secondary">{{ t('reviews.list_subtitle') }}</p>
    </div>

    <p v-if="!store.loaded && !store.errors.length" class="text-color-secondary">{{ t('common.loading') }}</p>

    <div v-else-if="!store.reviews.length" class="text-center p-4">
      <h3 class="m-0">{{ t('reviews.empty_title') }}</h3>
      <p class="m-0 mt-2 text-color-secondary">{{ t('reviews.empty_description') }}</p>
    </div>

    <pv-carousel v-else :value="store.reviews" :num-visible="3" :num-scroll="1"
                 :responsive-options="responsiveOptions">
      <template #item="{ data }">
        <div class="review-slide">
          <article class="review-card">
            <span class="review-quote" aria-hidden="true">“</span>
            <pv-rating :model-value="data.rating" readonly/>

            <p v-if="data.comment" class="review-comment">{{ data.comment }}</p>
            <p v-else class="review-comment text-color-secondary font-italic">{{ t('reviews.no_comment') }}</p>

            <footer class="flex align-items-center gap-3">
              <span class="review-avatar" aria-hidden="true">{{ initials(data) }}</span>
              <div class="flex flex-column">
                <span class="font-bold">{{ userName(data) }}</span>
                <span class="text-sm text-color-secondary">
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
.review-slide {
  height: 100%;
  padding: 0.5rem;
}

.review-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
  min-height: 15rem;
  padding: 1.75rem;
  border: 1px solid var(--p-content-border-color);
  border-radius: 12px;
  background: var(--p-content-background);
}

.review-quote {
  height: 1.75rem;
  font-family: Georgia, serif;
  font-size: 3.5rem;
  line-height: 1;
  color: var(--p-primary-color);
}

.review-comment {
  flex: 1;
  margin: 0;
  line-height: 1.6;
}

.review-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 50%;
  background: var(--p-primary-color);
  color: var(--p-primary-contrast-color);
  font-weight: 700;
}
</style>