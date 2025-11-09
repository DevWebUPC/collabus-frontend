<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useProjectCreateStore } from '../../application/project-create.store.js';

const { t } = useI18n();

// Use the project creation store
const store = useProjectCreateStore()

// Computed properties  
const roles = computed(() => store.rolesData || [])

// Role management methods
const addRole = () => {
  const newRole = {
    id: Date.now(),
    name: '',
    cards: [
      {
        id: Date.now() + 1,
        title: '',
        items: ['']
      }
    ]
  }
  store.rolesData.push(newRole)
}

const removeRole = (roleIndex) => {
  if (roleIndex < 0 || roleIndex >= rolesData.length) return
  store.rolesData.splice(roleIndex, 1)
}

const updateRoleName = (roleIndex, value) => {
  if (roleIndex < 0 || roleIndex >= store.rolesData.length) return
  store.rolesData[roleIndex].name = value
}

// Card management methods
const addCard = (roleIndex) => {
  if (roleIndex < 0 || roleIndex >= store.rolesData.length) return

  const newCard = {
    id: Date.now(),
    title: '',
    items: ['']
  }

  store.rolesData[roleIndex].cards.push(newCard)
}

const removeCard = (roleIndex, cardIndex) => {
  if (roleIndex < 0 || roleIndex >= store.rolesData.length) return
  if (cardIndex < 0 || cardIndex >= store.rolesData[roleIndex].cards.length) return

  store.rolesData[roleIndex].cards.splice(cardIndex, 1)
}

const updateCardTitle = (roleIndex, cardIndex, value) => {
  if (roleIndex < 0 || roleIndex >= store.rolesData.length) return
  if (cardIndex < 0 || cardIndex >= store.rolesData[roleIndex].cards.length) return

  store.rolesData[roleIndex].cards[cardIndex].title = value
}

// Item management methods
const addItem = (roleIndex, cardIndex) => {
  if (roleIndex < 0 || roleIndex >= store.rolesData.length) return
  if (cardIndex < 0 || cardIndex >= store.rolesData[roleIndex].cards.length) return

  store.rolesData[roleIndex].cards[cardIndex].items.push('')
}

const removeItem = (roleIndex, cardIndex, itemIndex) => {
  if (roleIndex < 0 || roleIndex >= store.rolesData.length) return
  if (cardIndex < 0 || cardIndex >= store.rolesData[roleIndex].cards.length) return
  if (itemIndex < 0 || itemIndex >= store.rolesData[roleIndex].cards[cardIndex].items.length) return

  store.rolesData[roleIndex].cards[cardIndex].items.splice(itemIndex, 1)
}

const updateItem = (roleIndex, cardIndex, itemIndex, value) => {
  if (roleIndex < 0 || roleIndex >= store.rolesData.length) return
  if (cardIndex < 0 || cardIndex >= store.rolesData[roleIndex].cards.length) return
  if (itemIndex < 0 || itemIndex >= store.rolesData[roleIndex].cards[cardIndex].items.length) return

  store.rolesData[roleIndex].cards[cardIndex].items[itemIndex] = value
}
</script>

<template>
  <div class="roles-step">
    <div class="step-header">
      <h2 class="step-title">{{ $t('projects.create.steps.define-roles') }}</h2>
    </div>

    <div class="roles-container">
      <div
          v-for="(role, roleIndex) in roles"
          :key="role.id"
          class="role-section"
      >
        <!-- Role Name Input -->
        <div class="role-input-wrapper">
          <span class="role-label">{{ $t('projects.create.role') }}</span>
          <pv-inputtext
              :model-value="role.name"
              @update:model-value="(value) => updateRoleName(roleIndex, value)"
              :placeholder="$t('projects.create.role-placeholder')"
              class="role-input"
          />
        </div>

        <!-- Role Cards -->
        <div class="role-cards-container">
          <div
              v-for="(card, cardIndex) in role.cards"
              :key="card.id"
              class="role-card"
          >
            <!-- Card Title -->
            <div class="card-title-section">
              <span class="card-title-label">{{ $t('projects.create.card-title-placeholder').replace('Escribe ', '') }}</span>
              <pv-inputtext
                  :model-value="card.title"
                  @update:model-value="(value) => updateCardTitle(roleIndex, cardIndex, value)"
                  :placeholder="$t('projects.create.card-title-placeholder')"
                  class="card-title-input"
              />
            </div>

            <!-- Card Items -->
            <div class="card-items-section">
              <div
                  v-for="(item, itemIndex) in card.items"
                  :key="itemIndex"
                  class="card-item-row"
              >
                <span class="item-number">{{ $t('projects.create.item') }}</span>
                <pv-inputtext
                    :model-value="item"
                    @update:model-value="(value) => updateItem(roleIndex, cardIndex, itemIndex, value)"
                    :placeholder="$t('projects.create.item-placeholder')"
                    class="item-input"
                />
                <pv-button
                    icon="pi pi-times"
                    severity="danger"
                    text
                    rounded
                    @click="removeItem(roleIndex, cardIndex, itemIndex)"
                    class="remove-item-btn"
                />
              </div>
            </div>

            <!-- Add Item Button -->
            <div class="add-item-section">
              <pv-button
                  :label="`+ ${$t('projects.create.add-item')}`"
                  text
                  @click="addItem(roleIndex, cardIndex)"
                  class="add-item-button"
              />
            </div>
          </div>

          <!-- Add Card Button -->
          <pv-button
              :label="$t('projects.create.add-card')"
              outlined
              @click="addCard(roleIndex)"
              class="add-card-button"
          />
        </div>
      </div>

      <!-- Add Role Button -->
      <pv-button
          :label="$t('projects.create.add-role')"
          @click="addRole"
          class="add-role-button"
      />
    </div>
  </div>
</template>

<style scoped>
.roles-step {
  padding: 1rem 0;
}

.step-header {
  margin-bottom: 2rem;
}

.step-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.roles-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.role-section {
  background: var(--color-white, #FFFFFF);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f5f9;
}

/* Role Input */
.role-input-wrapper {
  margin-bottom: 1.5rem;
}

.role-label {
  display: block;
  font-weight: 600;
  color: #1f2937;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.role-input {
  width: 100%;
}

/* Role Cards Container */
.role-cards-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Individual Role Card */
.role-card {
  background: var(--color-gray-300, #f8fafc);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
}

/* Card Title Section */
.card-title-section {
  margin-bottom: 1.5rem;
}

.card-title-label {
  display: block;
  font-weight: 600;
  color: #1f2937;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.card-title-input {
  width: 100%;
}

/* Card Items Section */
.card-items-section {
  margin-bottom: 1rem;
}

.card-item-row,
.add-item-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.item-number {
  font-weight: 500;
  color: var(--color-gray-900, #6b7280);
  font-size: 0.875rem;
  min-width: 40px;
  flex-shrink: 0;
}

.item-input {
  flex: 1;
}

.remove-item-btn {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.placeholder-btn {
  opacity: 0;
  pointer-events: none;
}

/* Add Item Section */
.add-item-section {
  padding-top: 0.5rem;
}

.add-item-button {
  color: #6C63FF;
  font-weight: 500;
  padding: 0.5rem 0;
}

/* Buttons */
.add-card-button {
  background: var(--color-white, #FFFFFF);
  border: 1px solid #6C63FF;
  color: #6C63FF;
  font-weight: 500;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  width: 100%;
  justify-content: center;
  margin-top: 1rem;
}

.add-card-button:hover {
  background: var(--color-gray-300, #f8fafc);
}

.add-role-button {
  background: #6C63FF;
  color: var(--color-white, #FFFFFF);
  font-weight: 600;
  padding: 0.875rem 2rem;
  border-radius: 12px;
  border: none;
  margin-top: 1rem;
}

.add-role-button:hover {
  background: #5B54FF;
}

/* Custom PrimeVue overrides */
:deep(.p-inputtext) {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

:deep(.p-inputtext:focus) {
  border-color: #6C63FF;
  box-shadow: 0 0 0 3px rgba(108, 99, 255, 0.1);
  outline: none;
}

:deep(.p-inputtext::placeholder) {
  color: #9ca3af;
  font-style: italic;
}

:deep(.p-button) {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
}

:deep(.p-button.p-button-text) {
  color: #6C63FF;
  background: transparent;
  border: none;
  padding: 0.5rem;
}

:deep(.p-button.p-button-text:hover) {
  background: rgba(108, 99, 255, 0.1);
}

:deep(.p-button.p-button-outlined) {
  background: var(--color-white, #FFFFFF);
  border: 1px solid #6C63FF;
  color: #6C63FF;
}

:deep(.p-button.p-button-outlined:hover) {
  background: var(--color-gray-300, #f8fafc);
}

:deep(.p-button:not(.p-button-outlined):not(.p-button-text)) {
  background: #6C63FF;
  border: none;
  color: var(--color-white, #FFFFFF);
}

:deep(.p-button:not(.p-button-outlined):not(.p-button-text):hover) {
  background: #5B54FF;
}

:deep(.p-button.p-button-danger) {
  color: #ef4444;
}

:deep(.p-button.p-button-danger:hover) {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

:deep(.p-button-icon) {
  font-size: 0.875rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .role-section {
    padding: 1.5rem;
    border-radius: 16px;
  }

  .role-card {
    padding: 1rem;
    border-radius: 12px;
  }

  .card-item-row,
  .add-item-row {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .item-number {
    min-width: auto;
  }

  .remove-item-btn {
    align-self: flex-end;
    width: auto;
    height: auto;
  }
}

@media (max-width: 480px) {
  .roles-step {
    padding: 0.5rem 0;
  }

  .role-section {
    padding: 1rem;
    border-radius: 12px;
  }

  .role-card {
    padding: 0.75rem;
    border-radius: 8px;
  }
}
</style>