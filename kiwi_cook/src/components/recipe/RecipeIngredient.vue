<template>
  <div class="ingredient-table">
    <div class="ingredient-row">
      <div class="ingredient-name">{{ formatName(getTranslation(ingredient.ingredient.name)) }}</div>
      <div class="ingredient-quantity">{{ formattedAmount }}</div>
      <div class="ingredient-checkbox">
        <q-checkbox v-model="isChecked" class="checkbox" @change="toggleCheck"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
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

// Function to format amount based on unit messageType
const formatAmount = (amount?: number, unit?: string): string => {
  if (amount === undefined || amount === null) {
    return '';
  }
  let amountStr = amount.toFixed(2); // Round to 2 decimal places

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
.ingredient-table {
  background: white; /* White background for clarity */
  border-radius: 12px; /* Soft rounded corners */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
  margin-bottom: 20px; /* Space between items */
  overflow: hidden; /* Clean edges for rows */
}

.ingredient-row {
  display: grid; /* Use grid layout for structured alignment */
  grid-template-columns: 1fr 1.5fr auto; /* Set columns for name, quantity, and checkbox */
  align-items: center; /* Center items vertically */
  padding: 1em; /* Ample padding for a spacious feel */
  border-bottom: 1px solid #f0f0f0; /* Light border for separation */
  transition: background 0.3s ease; /* Smooth background transition */
}

.ingredient-row:last-child {
  border-bottom: none; /* Remove border from the last item */
}

.ingredient-row:hover {
  background: rgba(245, 245, 245, 0.5); /* Subtle highlight on hover */
}

.ingredient-name {
  font-weight: 600; /* Slightly bolder for emphasis */
  color: #333; /* Darker color for ingredient names */
  font-size: 1.2em; /* Larger font size for readability */
}

.ingredient-quantity {
  font-weight: 500; /* Medium weight for quantity */
  color: #007aff; /* Distinct color for quantity for visibility */
  font-size: 1.1em; /* Slightly larger for emphasis */
  text-align: right; /* Right-align quantity for better readability */
}

.ingredient-checkbox {
  display: flex; /* Align checkbox to the right */
  align-items: center; /* Center checkbox vertically */
}
</style>
