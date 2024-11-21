<template>
  <q-input v-model="modelValue" :dark="isDark" filled :color="isDark ? 'light' : 'dark'"
    :bg-color="isDark ? 'dark-accent' : 'light-accent'" :label-color="isDark ? 'light' : 'dark'"
    :text-color="isDark ? 'white' : 'black'" :label="$t('chat.input.label')" @keydown="processInputFill"
    @focus="processInputFill" class="kiwi-chat-input" autofocus>
    <template v-slot:append>
      <q-btn round dense flat icon="send" :disable="modelValue.length === 0"
        :color="modelValue.length === 0 ? 'kiwi-light' : (isDark ? 'kiwi-light' : 'primary')"
        @click="() => handleMessage(modelValue)" />
    </template>
  </q-input>
</template>

<script lang="ts" setup>
import { watch } from 'vue';
import { useChatStore } from 'stores/chat-store';
import { storeToRefs } from 'pinia';
import { useDarkMode } from 'src/composables/useDarkmode';

const { isDark } = useDarkMode();

const chat = useChatStore();
const { userInput } = storeToRefs(chat);
const { handleMessage } = chat;

const modelValue = defineModel<string>('modelValue', { default: '' });

watch(userInput, () => {
  modelValue.value = userInput.value;
});

function processInputFill(e: Event) {
  if (!(e instanceof KeyboardEvent)) {
    return;
  }

  userInput.value = modelValue.value;

  switch (e.key) {
    case 'Escape':
      modelValue.value = '';
      break;
    case 'Enter':
      handleMessage(modelValue.value);
      modelValue.value = '';
      break;
    default:
      break;
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
