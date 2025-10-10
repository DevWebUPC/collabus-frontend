<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useHomeStore } from '../../application/home.store.js';

const { t } = useI18n();
const homeStore = useHomeStore();

// Filter options
const jobTypeOptions = ref([
  { label: t('home.filters.allJobs'), value: '' },
  { label: t('home.filters.developer'), value: 'dev' },
  { label: t('home.filters.designer'), value: 'design' },
  { label: t('home.filters.analyst'), value: 'analist' },
  { label: t('home.filters.projectManager'), value: 'project' },
  { label: t('home.filters.tester'), value: 'test' }
]);

const areaOptions = ref([
  { label: t('home.filters.allAreas'), value: '' },
  { label: t('home.filters.technology'), value: 'tecno' },
  { label: t('home.filters.webDevelopment'), value: 'web' },
  { label: t('home.filters.mobileDevelopment'), value: 'mobile' },
  { label: t('home.filters.dataScience'), value: 'data' },
  { label: t('home.filters.design'), value: 'design' },
  { label: t('home.filters.marketing'), value: 'marketing' }
]);

// Local reactive copies for form controls
const searchValue = ref(homeStore.searchFilter);
const jobTypeValue = ref(homeStore.jobTypeFilter);
const areaValue = ref(homeStore.areaFilter);

// Handle search button click - apply all filters and refresh projects
const handleSearch = async () => {
  // Update all filters in store
  homeStore.updateSearchFilter(searchValue.value);
  homeStore.updateJobTypeFilter(jobTypeValue.value);
  homeStore.updateAreaFilter(areaValue.value);
  
  // Refresh only the projects list (not collaborators or featured projects)
  await homeStore.loadAllProjects();
};

// Handle job type change (real-time filtering)
const handleJobTypeChange = (event) => {
  jobTypeValue.value = event.value;
  homeStore.updateJobTypeFilter(event.value);
};

// Handle area change (real-time filtering)
const handleAreaChange = (event) => {
  areaValue.value = event.value;
  homeStore.updateAreaFilter(event.value);
};

// Handle clear filters
const handleClearFilters = async () => {
  searchValue.value = '';
  jobTypeValue.value = '';
  areaValue.value = '';
  homeStore.clearFilters();
  
  // Refresh projects list after clearing filters
  await homeStore.loadAllProjects();
};

// Check if any filters are active
const hasActiveFilters = computed(() => 
  searchValue.value || 
  jobTypeValue.value || 
  areaValue.value
);
</script>

<template>
  <div class="search-filters-container">
    <div class="search-filters-content">

      <!-- Search and Filters -->
      <div class="filters-row">
        <!-- Search Input -->
        <div class="search-field">
          <span class="p-input-icon-left">
            <pv-inputtext 
              v-model="searchValue"
              :placeholder="t('home.filters.searchPlaceholder')"
              class="search-input"
              @keyup.enter="handleSearch"
            />
          </span>
        </div>

        <!-- Job Type Filter -->
        <div class="filter-field">
          <pv-dropdown
            v-model="jobTypeValue"
            :options="jobTypeOptions"
            option-label="label"
            option-value="value"
            :placeholder="t('home.filters.jobTypePlaceholder')"
            class="filter-dropdown"
            @change="handleJobTypeChange"
          >
            <template #value="slotProps">
              <div class="dropdown-value" v-if="slotProps.value">
                <i class="pi pi-briefcase"></i>
                <span>{{ jobTypeOptions.find(opt => opt.value === slotProps.value)?.label || slotProps.value }}</span>
              </div>
              <div class="dropdown-value" v-else>
                <i class="pi pi-briefcase"></i>
                <span>{{ t('home.filters.jobTypePlaceholder') }}</span>
              </div>
            </template>
          </pv-dropdown>
        </div>

        <!-- Area Filter -->
        <div class="filter-field">
          <pv-dropdown
            v-model="areaValue"
            :options="areaOptions"
            option-label="label"
            option-value="value"
            :placeholder="t('home.filters.areaPlaceholder')"
            class="filter-dropdown"
            @change="handleAreaChange"
          >
            <template #value="slotProps">
              <div class="dropdown-value" v-if="slotProps.value">
                <i class="pi pi-folder"></i>
                <span>{{ areaOptions.find(opt => opt.value === slotProps.value)?.label || slotProps.value }}</span>
              </div>
              <div class="dropdown-value" v-else>
                <i class="pi pi-folder"></i>
                <span>{{ t('home.filters.areaPlaceholder') }}</span>
              </div>
            </template>
          </pv-dropdown>
        </div>

        <!-- Search Button -->
        <pv-button
          :label="t('home.filters.search')"
          icon="pi pi-search"
          class="search-button"
          @click="handleSearch"
        />

        <!-- Clear Filters Button -->
        <pv-button
          v-if="hasActiveFilters"
          :label="t('home.filters.clearFilters')"
          icon="pi pi-times"
          class="clear-button"
          severity="secondary"
          outlined
          @click="handleClearFilters"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-filters-container {
  width: 100%;
  padding: 0 2rem;
}

.search-filters-content {
  max-width: 1400px;
  margin: 0 auto;
}

/* Header Section */
.header-section {
  text-align: center;
  margin-bottom: 2rem;
}

.main-title {
  font-size: 3rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
  margin: 0;
  font-weight: 300;
}

/* Filters Row */
.filters-row {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}

/* Search Field */
.search-field {
  flex: 1;
  min-width: 300px;
  max-width: 400px;
}

.search-input {
  width: 100%;
  height: 48px;
  font-size: 1rem;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.search-input:focus {
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
}

/* Filter Fields */
.filter-field {
  min-width: 200px;
}

.filter-dropdown {
  width: 100%;
  height: 48px;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.dropdown-value {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Buttons */
.search-button {
  height: 48px;
  padding: 0 1.5rem;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  font-weight: 600;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
	background: var(--color-primary);
}

.search-button:hover {
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}

.clear-button {
  height: 48px;
  padding: 0 1rem;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.clear-button:hover {
  border-color: rgba(255, 255, 255, 0.5);
}

/* Responsive */
@media (max-width: 1024px) {
  .filters-row {
    flex-direction: column;
    align-items: stretch;
  }

  .search-field,
  .filter-field {
    min-width: unset;
    max-width: unset;
  }
}

@media (max-width: 768px) {
  .search-filters-container {
    padding: 0 1rem;
  }

  .main-title {
    font-size: 2.5rem;
  }

  .subtitle {
    font-size: 1.1rem;
  }

  .header-section {
    margin-bottom: 1.5rem;
  }

  .filters-row {
    gap: 0.75rem;
  }
}
</style>