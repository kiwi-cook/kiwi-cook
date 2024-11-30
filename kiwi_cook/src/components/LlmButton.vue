<template>
    <q-btn v-if="!result" class="q-mt-md llm-task-button" :class="{ 'loading': modelDownloading }"
        :loading="!taskFinished" @click="executeTask">
        <!-- Loading slot with different spinners and tooltips -->
        <template v-slot:loading>
            <div class="row items-center">
                <q-spinner-dots v-if="modelDownloading" color="white" class="on-left" size="1.5em" />
                <q-spinner-bars v-else color="white" class="on-left" size="1.5em" />
                <span class="q-ml-sm">
                    {{ modelDownloading ? `${$t('llm.downloading')} ${modelDownloadProgress}%` : $t('llm.processing') }}
                </span>
            </div>
        </template>

        <!-- Default slot with customizable icon and text -->
        <template v-slot:default>
            <div class="row items-center">
                <q-icon :name="icon" class="q-mr-sm" />
                <slot name="button-text">
                    {{ buttonText }}
                </slot>
            </div>
        </template>
    </q-btn>
</template>

<script setup lang="ts">
import {
  watch,
  computed, defineEmits, defineProps, withDefaults,
} from 'vue';
import { LlmTask, useLlm } from 'src/composables/llm/useLlm';
import { useI18n } from 'vue-i18n';

interface Props {
    // The type of LLM task to perform (e.g., 'summarization', 'translation', etc.)
    taskType: LlmTask;
    // The text to be processed by the LLM
    input: unknown;
    // Icon to display on the button (default: mdi-creation)
    icon?: string;
    // Custom button text (falls back to translated task type if not provided)
    buttonText?: string;
    // Additional task-specific parameters
    taskParams?: Record<string, unknown>;
}

const props = withDefaults(defineProps<Props>(), {
  maxLength: 2500,
  icon: 'mdi-creation',
  taskParams: () => ({}),
});

const emit = defineEmits<{(e: 'on-output', result: unknown): void;
    (e: 'on-error', error: Error): void;
    (e: 'on-start'): void;
}>();

const { t } = useI18n();

// LLM Setup
const transformer = useLlm(props.taskType);
const taskFinished = computed(() => !transformer.isRunning.value);
const modelDownloading = computed(() => transformer.status.value === 'download');
const modelDownloadProgress = computed(() => transformer.downloadProgress.value);
const result = computed<unknown>(() => transformer.cleanedData.value);

// Computed button text
const buttonText = computed(() => props.buttonText || t(`llm.tasks.${props.taskType}`));

// Watch for results and emit events
watch(result, (newResult: unknown) => {
  if (newResult) {
    emit('on-output', newResult);
  }
});

async function executeTask() {
  try {
    emit('on-start');
    transformer.exec(props.input);
  } catch (error) {
    emit('on-error', error as Error);
  }
}
</script>

<style lang="scss" scoped>
.llm-task-button {
    /* Base styles */
    background: linear-gradient(135deg, #7047EB, #5727B0);
    color: white;
    padding: 12px 24px;
    border: none;
    border-radius: 8x;
    font-weight: 700;
    cursor: pointer;
    position: relative;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(112, 71, 235, 0.2);
    overflow: hidden;

    /* Layout styles */
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Hover effect */
.llm-task-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(112, 71, 235, 0.3);
    background: linear-gradient(135deg, #8665EB, #7047EB);
}

/* Click effect */
.llm-task-button:active {
    transform: translateY(1px);
    box-shadow: 0 2px 10px rgba(112, 71, 235, 0.2);
}

/* Shine effect on hover */
.llm-task-button::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(45deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent);
    transform: rotate(45deg);
    transition: all 0.3s ease;
    opacity: 0;
}

/* Loading state */
.llm-task-button.loading {
    background: linear-gradient(135deg, #7047EB, #5727B0);
    pointer-events: none;
    opacity: 0.8;
}

.llm-task-button:hover::after, .llm-task-button.loading::after {
    opacity: 1;
    animation: shine 1.5s ease-out infinite;
}

@keyframes shine {
    0% {
        transform: translateX(-100%) rotate(45deg);
    }

    100% {
        transform: translateX(100%) rotate(45deg);
    }
}

@keyframes pulse {
    0% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }

    100% {
        opacity: 1;
    }
}
</style>
