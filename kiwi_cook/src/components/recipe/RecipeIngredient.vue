<template>
  <q-item class="ingredient-item">
    <q-item-section>
      <span class="ingredient-name">{{ formatName(getTranslation(ingredient.ingredient.name)) }}</span>
      <span class="ingredient-quantity">{{ formattedAmount }}</span>
    </q-item-section>
    <q-item-section side>
      <q-checkbox v-model="isChecked" @change="toggleCheck" class="checkbox"/>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import {
  computed, defineEmits, defineProps, ref, watch,
} from 'vue';
import { getTranslation } from 'src/models/recipe';

const props = defineProps({
  ingredient: {
    type: Object,
    required: true,
  },
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue']);

// Local state for the checkbox
const isChecked = ref(props.modelValue);

// Watch for changes to the modelValue prop
watch(() => props.modelValue, (newValue) => {
  isChecked.value = newValue;
});

// Computed property for formatted amount
const formattedAmount = computed(() => {
  const { quantity, unit } = props.ingredient;
  return formatAmount(quantity, unit);
});

// Method to toggle check state and emit the change
const toggleCheck = () => {
  isChecked.value = !isChecked.value;
  emit('update:modelValue', isChecked.value);
};

// Function to format amount based on unit type
const formatAmount = (amount?: number, unit?: string): string => {
  if (amount === undefined || amount === null) {
    return '';
  }
  let amountStr = amount.toString();

  // Round to 10th decimal place
  amountStr = amount.toFixed(2);

  // Convert to US units if needed (example)
  if (unit === 'g') {
    amountStr = `${Math.round(amount * 0.035274)} oz`;
  } else if (unit === 'ml') {
    amountStr = `${Math.round(amount * 0.033814)} fl oz`;
  }

  return `${amountStr} ${unit || ''}`.trim();
};

// Capitalize first letter of each word
const formatName = (name: string): string => name.replace(/\b\w/g, (char) => char.toUpperCase());
</script>

<style scoped>
.ingredient-item {
  padding: 0.5em 0;
  display: flex;
  justify-content: space-between;
}

.ingredient-name {
  font-weight: 500; /* Medium weight for ingredient names */
  color: #555; /* Dark gray for ingredient names */
}

.ingredient-quantity {
  color: #888; /* Lighter color for quantity for visual hierarchy */
  margin-left: 8px; /* Space between name and quantity */
}

.checkbox {
  margin-left: 8px; /* Space for checkbox */
}
</style>
