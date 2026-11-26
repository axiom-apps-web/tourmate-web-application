<script setup>
import {computed, onMounted, ref, watch} from "vue";
import {storeToRefs} from "pinia";
import {useI18n} from "vue-i18n";
import useProfileStore from "../../application/profile.store.js";
import useIamStore from "../../../iam/application/iam.store.js";
import {UserRole} from "../../../iam/domain/model/value-object/user-role.js";

const {t} = useI18n();
const profileStore = useProfileStore();
const iamStore = useIamStore();
const {profiles, profilesLoaded, errors: profileErrors} = storeToRefs(profileStore);
const {users, usersLoaded, errors: iamErrors} = storeToRefs(iamStore);
const selectedProfileId = ref("");

const selectedProfile = computed(() =>
    profiles.value.find(profile => String(profile.id) === selectedProfileId.value)
);
const selectedUser = computed(() =>
    users.value.find(user => String(user.id) === String(selectedProfile.value?.userId))
);
const roleLabel = computed(() => {
  const roleLabels = {
    [UserRole.ADMIN]: "profiles.roles.admin",
    [UserRole.AGENCY_OWNER]: "profiles.roles.agency_owner",
    [UserRole.GUIDE]: "profiles.roles.guide",
    [UserRole.TOURIST]: "profiles.roles.tourist",
  };
  const roleKey = roleLabels[selectedUser.value?.role];
  return roleKey ? t(roleKey) : t("profiles.not_available");
});
const profileName = computed(() => {
  const profile = selectedProfile.value;
  return profile?.fullName?.trim() ||
      [profile?.firstName, profile?.lastName].filter(Boolean).join(" ").trim() ||
      t("profiles.name_unavailable");
});
const profileInitials = computed(() => {
  const initials = profileName.value
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part.charAt(0).toLocaleUpperCase());
  return initials.join("") || "?";
});
const errors = computed(() => [...profileErrors.value, ...iamErrors.value]);
const isLoading = computed(() =>
    (!profilesLoaded.value || !usersLoaded.value) && errors.value.length === 0
);

watch(profiles, currentProfiles => {
  const selectedProfileExists = currentProfiles.some(
      profile => String(profile.id) === selectedProfileId.value
  );
  if (!selectedProfileExists) {
    selectedProfileId.value = currentProfiles.length ? String(currentProfiles[0].id) : "";
  }
}, {immediate: true});

onMounted(() => {
  if (!profilesLoaded.value) profileStore.fetchProfiles();
  if (!usersLoaded.value) iamStore.fetchUsers();
});
</script>

<template>
  <section class="profile-page page-shell" aria-labelledby="profile-page-title">
    <header class="profile-page__header">
      <div>
        <p class="profile-page__eyebrow">{{ t("shell.workspace") }}</p>
        <h1 id="profile-page-title" class="page-heading">{{ t("profiles.title") }}</h1>
        <p class="page-description">{{ t("profiles.description") }}</p>
      </div>
      <span class="profile-page__header-icon" aria-hidden="true">
        <i class="pi pi-user"></i>
      </span>
    </header>

    <p v-if="isLoading" class="profile-page__state" role="status" aria-live="polite">
      <i class="pi pi-spin pi-spinner" aria-hidden="true"></i>
      {{ t("profiles.loading") }}
    </p>

    <div v-else-if="errors.length" class="profile-page__state profile-page__state--error" role="alert">
      {{ t("profiles.load_error") }}
    </div>

    <div v-else-if="profiles.length === 0" class="profile-page__empty">
      <span class="profile-page__empty-icon" aria-hidden="true"><i class="pi pi-user"></i></span>
      <h2>{{ t("profiles.empty_title") }}</h2>
      <p>{{ t("profiles.empty_description") }}</p>
    </div>

    <div v-else class="profile-content">
      <div class="profile-selector surface-card">
        <label for="profile-selector">{{ t("profiles.select_label") }}</label>
        <select
            id="profile-selector"
            v-model="selectedProfileId"
            aria-describedby="profile-selector-hint"
        >
          <option v-for="profile in profiles" :key="profile.id" :value="String(profile.id)">
            {{ profile.fullName?.trim() || profile.email || t("profiles.profile_option", {id: profile.id}) }}
          </option>
        </select>
        <p id="profile-selector-hint">{{ t("profiles.select_hint") }}</p>
      </div>

      <article
          v-if="selectedProfile"
          class="profile-card surface-card"
          aria-labelledby="selected-profile-name"
      >
        <header class="profile-card__header">
          <span class="profile-card__avatar" aria-hidden="true">{{ profileInitials }}</span>
          <div class="profile-card__identity">
            <p class="profile-card__eyebrow">{{ t("profiles.details_heading") }}</p>
            <h2 id="selected-profile-name">{{ profileName }}</h2>
            <p>{{ t("profiles.profile_id", {id: selectedProfile.id}) }}</p>
          </div>
        </header>

        <div class="profile-card__section">
          <h3>{{ t("profiles.contact_heading") }}</h3>
          <dl class="profile-details">
            <div class="profile-details__item">
              <dt>
                <i class="pi pi-envelope" aria-hidden="true"></i>
                {{ t("profiles.email") }}
              </dt>
              <dd>
                <a v-if="selectedProfile.email" :href="`mailto:${selectedProfile.email}`">
                  {{ selectedProfile.email }}
                </a>
                <span v-else>{{ t("profiles.not_available") }}</span>
              </dd>
            </div>
            <div class="profile-details__item">
              <dt>
                <i class="pi pi-map-marker" aria-hidden="true"></i>
                {{ t("profiles.address") }}
              </dt>
              <dd>{{ selectedProfile.streetAddress || t("profiles.not_available") }}</dd>
            </div>
            <div class="profile-details__item">
              <dt>
                <i class="pi pi-briefcase" aria-hidden="true"></i>
                {{ t("profiles.role") }}
              </dt>
              <dd>{{ roleLabel }}</dd>
            </div>
          </dl>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.profile-page {
  display: grid;
  gap: 1.5rem;
}

.profile-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
}

.profile-page__eyebrow,
.profile-card__eyebrow {
  margin: 0 0 0.5rem;
  color: var(--tm-green-800);
  font-size: 0.75rem;
  font-weight: 750;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.profile-page__header-icon,
.profile-page__empty-icon {
  display: grid;
  width: 3.5rem;
  height: 3.5rem;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 1rem;
  background: var(--tm-green-100);
  color: var(--tm-green-900);
  font-size: 1.35rem;
}

.profile-content {
  display: grid;
  gap: 1rem;
}

.profile-selector {
  display: grid;
  gap: 0.55rem;
  padding: clamp(1rem, 3vw, 1.4rem);
}

.profile-selector label {
  color: var(--tm-text);
  font-weight: 700;
}

.profile-selector select {
  width: 100%;
  min-height: 2.8rem;
  padding: 0.55rem 0.75rem;
  border: 1px solid var(--tm-border);
  border-radius: 0.6rem;
  background: var(--tm-surface);
  color: var(--tm-text);
}

.profile-selector p {
  margin: 0;
  color: var(--tm-muted);
  font-size: 0.88rem;
}

.profile-card {
  min-width: 0;
  overflow: hidden;
}

.profile-card__header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: clamp(1.25rem, 4vw, 2rem);
  background: linear-gradient(120deg, var(--tm-green-50), var(--tm-surface));
  border-bottom: 1px solid var(--tm-border);
}

.profile-card__avatar {
  display: grid;
  width: clamp(3.75rem, 12vw, 5rem);
  aspect-ratio: 1;
  flex: 0 0 auto;
  place-items: center;
  border: 3px solid var(--tm-surface);
  border-radius: 50%;
  background: var(--tm-green-900);
  color: var(--tm-surface);
  font-size: clamp(1.25rem, 4vw, 1.8rem);
  font-weight: 750;
}

.profile-card__identity {
  min-width: 0;
}

.profile-card__identity h2 {
  margin: 0;
  color: var(--tm-text);
  font-family: var(--tm-heading-font);
  font-size: clamp(1.4rem, 4vw, 2rem);
  overflow-wrap: anywhere;
}

.profile-card__identity > p:last-child {
  margin: 0.35rem 0 0;
  color: var(--tm-muted);
  font-size: 0.9rem;
}

.profile-card__section {
  padding: clamp(1.25rem, 4vw, 2rem);
}

.profile-card__section h3 {
  margin: 0 0 1rem;
  color: var(--tm-text);
  font-size: 1.05rem;
}

.profile-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
  gap: 1rem;
  margin: 0;
}

.profile-details__item {
  min-width: 0;
  padding: 1rem;
  border: 1px solid var(--tm-border);
  border-radius: 0.75rem;
}

.profile-details dt {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  color: var(--tm-muted);
  font-size: 0.85rem;
  font-weight: 650;
}

.profile-details dt i {
  color: var(--tm-green-800);
}

.profile-details dd {
  margin: 0.55rem 0 0;
  color: var(--tm-text);
  line-height: 1.55;
  overflow-wrap: anywhere;
}

.profile-details a {
  color: var(--tm-green-900);
  text-decoration-thickness: 1px;
  text-underline-offset: 0.18em;
}

.profile-page__state,
.profile-page__empty {
  display: grid;
  justify-items: center;
  gap: 0.75rem;
  padding: clamp(2rem, 7vw, 4rem) 1rem;
  color: var(--tm-muted);
  text-align: center;
}

.profile-page__state {
  display: flex;
  justify-content: center;
}

.profile-page__state--error {
  color: var(--tm-danger);
}

.profile-page__empty h2,
.profile-page__empty p {
  margin: 0;
}

.profile-page__empty h2 {
  color: var(--tm-text);
}

.profile-page__empty p {
  max-width: 36rem;
  line-height: 1.6;
}

@media (max-width: 600px) {
  .profile-page__header {
    align-items: flex-start;
  }

  .profile-page__header-icon {
    width: 2.8rem;
    height: 2.8rem;
    font-size: 1.1rem;
  }
}
</style>
