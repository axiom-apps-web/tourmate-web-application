<script setup>
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import useFeedbackStore from "../../application/feedback.store.js";
import {Review} from "../../domain/model/review.entity.js";
import {useConfirm} from "primevue";

const { t } = useI18n();
const store = useFeedbackStore();
const confirm = useConfirm();
const dialogVisible = ref(false);
const saving = ref(false);
const editingId = ref(null);
const form = ref({userId: null, tourId: null, rating: 5, comment: ''});

onMounted(() => {
  store.fetchReviews();
});

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.getFullYear();
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

function openNewReview() {
  editingId.value = null;
  form.value = {userId: null, tourId: null, rating: 5, comment: ''};
  dialogVisible.value = true;
}

function openEditReview(review) {
  editingId.value = review.id;
  form.value = {userId: review.userId, tourId: review.tourId, rating: review.rating, comment: review.comment};
  dialogVisible.value = true;
}

async function saveReview() {
  if (!form.value.userId || !form.value.tourId ||
      !Number.isInteger(Number(form.value.rating)) || Number(form.value.rating) < 1 || Number(form.value.rating) > 5) return;
  saving.value = true;
  const review = new Review({
    id: editingId.value,
    userId: Number(form.value.userId),
    tourId: Number(form.value.tourId),
    rating: Number(form.value.rating),
    comment: form.value.comment.trim(),
    commentId: editingId.value ? store.getReviewById(editingId.value)?.commentId ?? null : null,
    createdAt: editingId.value ? store.getReviewById(editingId.value)?.createdAt : new Date().toISOString()
  });
  const saved = editingId.value
      ? await store.updateReview(review)
      : await store.addReview(review);
  saving.value = false;
  if (saved) dialogVisible.value = false;
}

function confirmDelete(review) {
  confirm.require({
    message: t('reviews.delete_confirm'),
    header: t('reviews.delete'),
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: () => store.deleteReview(review)
  });
}
</script>

<template>
  <section class="reviews-page page-shell" aria-labelledby="reviews-title">
    <header class="reviews-header">
      <p class="reviews-eyebrow">{{ t('shell.workspace') }}</p>
      <h1 id="reviews-title" class="page-heading">{{ t('reviews.list_title') }}</h1>
      <p class="page-description">{{ t('reviews.list_subtitle') }}</p>
      <pv-button class="reviews-add" :label="t('reviews.add_new')" icon="pi pi-plus" :disabled="!store.loaded" @click="openNewReview" />
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

    <div v-else class="reviews-grid">
      <article v-for="data in store.reviews" :key="data.id" class="review-card surface-card">
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
            <div class="review-actions" role="group" :aria-label="t('reviews.actions')">
              <pv-button :label="t('reviews.edit')" icon="pi pi-pencil" text @click="openEditReview(data)" />
              <pv-button :label="t('reviews.delete')" icon="pi pi-trash" severity="danger" text @click="confirmDelete(data)" />
            </div>
      </article>
    </div>

    <pv-dialog v-model:visible="dialogVisible" modal :header="t(editingId ? 'reviews.edit_title' : 'reviews.new_title')" :style="{width: 'min(36rem, 94vw)'}">
      <form class="review-form" @submit.prevent="saveReview">
        <label for="review-user">{{ t('reviews.user') }} *</label>
        <select id="review-user" v-model="form.userId" required>
          <option :value="null" disabled>{{ t('reviews.user_id_label') }}</option>
          <option v-for="user in store.users" :key="user.id" :value="user.id">
            {{ [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || `#${user.id}` }}
          </option>
        </select>
        <label for="review-tour">{{ t('reviews.tour_id') }} *</label>
        <select id="review-tour" v-model="form.tourId" required>
          <option :value="null" disabled>{{ t('reviews.tour_id_label') }}</option>
          <option v-for="tour in store.tours" :key="tour.id" :value="tour.id">{{ tour.title }}</option>
        </select>
        <label for="review-rating">{{ t('reviews.rating_label') }}</label>
        <select id="review-rating" v-model.number="form.rating" required>
          <option v-for="rating in [1, 2, 3, 4, 5]" :key="rating" :value="rating">{{ rating }} / 5</option>
        </select>
        <label for="review-comment">{{ t('reviews.comment_label') }}</label>
        <textarea id="review-comment" v-model="form.comment" rows="4" maxlength="2000"></textarea>
        <div class="review-form__actions">
          <pv-button type="submit" :label="t(editingId ? 'reviews.update' : 'reviews.submit')" icon="pi pi-save" :loading="saving" />
          <pv-button type="button" :label="t('reviews.cancel')" severity="secondary" outlined @click="dialogVisible = false" />
        </div>
      </form>
    </pv-dialog>
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

.reviews-add {
  margin-top: 1rem;
}

.reviews-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 19rem), 1fr));
  gap: 1rem;
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
  color: var(--tm-action-text);
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

.review-actions,
.review-form__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.review-form {
  display: grid;
  gap: 0.55rem;
}

.review-form label {
  margin-top: 0.3rem;
  color: var(--tm-text);
  font-weight: 600;
}

.review-form select,
.review-form textarea {
  width: 100%;
  min-height: 2.6rem;
  padding: 0.5rem 0.65rem;
  border: 1px solid var(--tm-border);
  border-radius: 0.5rem;
  background: var(--tm-surface);
  color: var(--tm-text);
}

.review-form textarea {
  resize: vertical;
}

.review-form__actions {
  margin-top: 0.75rem;
}

@media (max-width: 600px) {
  .review-card {
    min-height: 15rem;
  }
}
</style>