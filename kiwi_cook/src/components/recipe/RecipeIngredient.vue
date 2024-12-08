<template>
  <div class="ingredient-table">
    <div class="ingredient-row">
      <div class="ingredient-name">
        {{ formatName(getTranslation(ingredient.ingredient.name)) }}
      </div>
      <div class="ingredient-quantity">
        {{ formattedAmount }}
      </div>
      <div class="ingredient-checkbox">
        <q-checkbox v-model="checked" color="primary" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, defineProps, ref } from 'vue'

import { getTranslation } from 'src/models/recipe'
import { formatName } from 'src/utils/string'

const props = defineProps({
  ingredient: {
    type: Object,
    required: true,
  },
  servings: {
    type: Number,
    default: 1,
  },
})

const checked = ref(false)

// Computed property for formatted amount
const formattedAmount = computed(() => {
  const { servings } = props
  const { quantity, unit } = props.ingredient
  return formatAmount(quantity, unit, servings)
})

// Function to format amount based on unit messageType
const formatAmount = (amount?: number, unit?: string, servings = 1): string => {
  if (amount === undefined || amount === null) {
    return ''
  }

  // Multiply amount by servings
  const realAmount = amount * servings

  // If number does not have precision
  let amountStr = ''
  if (realAmount % 1 === 0) {
    amountStr = Math.round(amount).toString()
  } else {
    amountStr = realAmount.toFixed(2)
  }

  // Convert to US units if needed (example)
  if (unit === 'g') {
    amountStr = `${Math.round(amount * 0.035274)} oz`
  } else if (unit === 'ml') {
    amountStr = `${Math.round(amount * 0.033814)} fl oz`
  }

  return `${amountStr} ${unit || ''}`.trim()
}
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
