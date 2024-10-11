<template>
  <q-input
    v-model="modelValue"
    :dark="isDark"
    filled
    :color="isDark ? 'kiwi-light' : 'kiwi-dark'"
    :bg-color="isDark ? 'kiwi-dark-accent' : 'kiwi-light-accent'"
    :label-color="isDark ? 'kiwi-light' : 'kiwi-dark'"
    :text-color="isDark ? 'white' : 'black'"
    :label="$t('chatbox.label')"
    :shadow-text="inputShadowText"
    @keydown="processInputFill"
    @focus="processInputFill"
    class="kiwi-chat-input"
  >
    <template v-slot:append>
      <q-btn
        round
        dense
        flat
        icon="send"
        :disable="modelValue.length === 0"
        :color="modelValue.length === 0 ? 'kiwi-light' : (isDark ? 'kiwi-light' : 'kiwi-green')"
        @click="() => handleMessage(modelValue)"
      />
    </template>
  </q-input>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useChatStore } from 'stores/chat-store.ts';
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const isDark = computed(() => $q.dark.isActive);

const chat = useChatStore();
const { newInput, shadowInput } = storeToRefs(chat);
const {
  handleMessage,
} = chat;

const modelValue = defineModel<string>('modelValue', { default: '' });

const inputFillCancelled = ref(false);
const inputShadowText = computed(() => {
  if (inputFillCancelled.value) {
    return '';
  }

  const t = shadowInput.value;
  if (modelValue.value.length === 0) {
    return t;
  }
  if (t.indexOf(modelValue.value) !== 0) {
    return '';
  }

  return t
    .split(modelValue.value)
    .slice(1)
    .join(modelValue.value);
});

watch(newInput, () => {
  modelValue.value = newInput.value;
});

function processInputFill(e: Event) {
  if (!(e instanceof KeyboardEvent)) {
    return;
  }

  newInput.value = modelValue.value;

  switch (e.key) {
    case 'Escape':
      if (!inputFillCancelled.value) {
        inputFillCancelled.value = true;
      }
      break;
    case 'Enter':
      handleMessage(modelValue.value);
      modelValue.value = '';
      break;
    default:
      inputFillCancelled.value = false;
  }
}
</script>

<style lang="scss">
.kiwi-chat-input {
  .q-field__control {
    border-radius: 24px;
  }

  .q-field__marginal {
    height: 56px;
  }
}
</style>
