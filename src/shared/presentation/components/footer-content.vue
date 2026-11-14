<template>
  <footer class="app-footer">
    <p>Copyright &copy; 2026 TourMate</p>
  </footer>
</template>

<style scoped>
.app-footer {
  display: flex;
  min-height: 4rem;
  align-items: center;
  justify-content: center;
  margin-top: 2rem;
  padding: 1rem;
  border-top: 1px solid var(--tm-border);
  background: var(--tm-surface);
  color: var(--tm-muted);
  text-align: center;
}

.app-footer p {
  margin: 0;
  font-size: 0.875rem;
}
</style>