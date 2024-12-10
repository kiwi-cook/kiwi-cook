<template>
  <div class="ingredient-table">
    <div class="ingredient-row">
      <div class="ingredient-name">
        {{ formatName(ingredient) }}
      </div>
      <div class="ingredient-quantity">
        {{ adjustedAmount }}
      </div>
      <div class="ingredient-checkbox">
        <q-checkbox v-model="checked" color="primary" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, defineProps, ref } from 'vue'

import { parseIngredient } from 'src/utils/parse'

// Define props
const props = defineProps({
  ingredient: {
    type: String,
    required: true,
  },
  servings: {
    type: Number,
    default: 1,
  },
})

// Reactive state for the checkbox
const checked = ref(false)

// Parse the ingredient using the imported parseIngredient function
const parsedIngredient = computed(() => parseIngredient(props.ingredient))

// Adjust the amount based on the number of servings
const adjustedAmount = computed(() => {
  if (parsedIngredient.value.amount !== undefined) {
    return parsedIngredient.value.amount * props.servings
  }
  return undefined
})
</script>

<style lang="scss" scoped>
.ingredient-table {
  background: white; /* White background */
  border-radius: 12px; /* Soft rounded corners */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
  margin-bottom: 10px; /* Space between items */
  overflow: hidden; /* Clean edges for rows */
}

.ingredient-row {
  display: grid; /* Use grid layout for structured alignment */
  grid-template-columns: 1fr 1.5fr auto; /* Set columns for name, quantity, and checkbox */
  align-items: center; /* Center items vertically */
  padding: 12px 16px; /* Padding for spacing */
  border-bottom: 1px solid #f0f0f0; /* Light border for separation */
}

.ingredient-row:last-child {
  border-bottom: none; /* Remove border from the last item */
}

.ingredient-quantity {
  text-align: right; /* Right-align quantity for better readability */
}

.ingredient-checkbox {
  display: flex; /* Align checkbox to the right */
  align-items: center; /* Center checkbox vertically */
}

.body--dark {
  .ingredient-table {
    background: $dark; /* Dark background for dark mode */
  }

  .ingredient-row {
    border-bottom: 1px solid $dark; /* Darker border for separation */
  }
}
</style>
