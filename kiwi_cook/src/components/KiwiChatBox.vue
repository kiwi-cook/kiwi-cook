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
        :color="isDark ? 'kiwi-light' : 'kiwi-dark'"
        @click="() => sendUserMessage"
      />
    </template>
  </q-input>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useChatStore } from 'stores/chat-store.ts';
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const isDark = computed(() => $q.dark.isActive);

const chat = useChatStore();
const { newMessage } = storeToRefs(chat);
const {
  sendUserMessage,
} = chat;

const modelValue = defineModel<string>('modelValue', { default: '' });

const inputFillCancelled = ref(false);
const inputShadowText = computed(() => {
  if (inputFillCancelled.value) {
    return '';
  }

  const t = 'Text filled when you press TAB';
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

function processInputFill(e: Event) {
  if (!(e instanceof KeyboardEvent)) {
    return;
  }

  newMessage.value = modelValue.value;

  switch (e.key) {
    case 'Escape':
      if (!inputFillCancelled.value) {
        inputFillCancelled.value = true;
      }
      break;
    case 'Enter':
      sendUserMessage();
      modelValue.value = '';
      break;
    case 'Tab':
      if (!inputFillCancelled.value && inputShadowText.value.length > 0) {
        e.preventDefault();
        modelValue.value += inputShadowText.value;
      }
      break;
    default:
      if (inputFillCancelled.value) {
        inputFillCancelled.value = false;
      }
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
