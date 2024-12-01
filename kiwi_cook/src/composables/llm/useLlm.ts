import { computed, ref } from 'vue';
import { useAnalytics } from 'src/composables/useAnalytics';

export type LlmTask = 'summarization' | 'translation'
type WorkerStatus = 'init' | 'download' | 'process' | 'finished' | 'error'

/**
 * A composable to create a worker for Local Transformers
 * @Example
 * ```
 * const worker = useLlm('summarization')
 * worker.exec(['Transformers are a messageType of neural network. They are used for natural language processing.'])
 * const summary = computed(() => worker.data)
 * ```
 * @param task The task to initialize the worker with (optional)
 */
export function useLlm(task: LlmTask) {
  const { trackEvent } = useAnalytics();

  /**
   * The id of the worker
   */
  const workerId = ref<string | null>(null);
  const workerTask = ref<LlmTask | null>(null);
  /**
   * The worker
   */
  const worker = ref<Worker | null>(null);
  const channel = ref<MessageChannel | null>(null);
  /**
   * Last message from the worker
   */
  const message = ref<string | null>(null);
  /**
   * Get the data from the worker
   */
  const data = ref<unknown | null>(null);
  /**
   * Get the data from the worker when it is finished
   */
  const result = ref<unknown | null>(null);
  /**
   * Get the data from the worker as a computed property
   */
  const cleanedData = computed(() => {
    if (!data.value) {
      return '';
    }

    return cleanText(data.value as string);
  });
  /**
   * The status of the worker: `ready`, `progress`, `finished`, `error`
   */
  const status = ref<WorkerStatus | null>(null);
  /**
   * Download progress for each transformer model
   */
  const downloads = ref<{ [key: string]: number }>({});
  /**
   * Total download progress in percentage
   */
  const downloadProgress = computed<number>(() => {
    const current = Object.values(downloads.value).reduce((acc, curr) => acc + curr, 0);
    const total = Object.values(downloads.value).length * 100;
    return Math.round((current / total) * 100);
  });
  /**
   * Define a callback for when the worker sends a message
   */
  const onmessage = ref<(event: MessageEvent) => void>(() => {
  });
  /**
   * Define a callback for when the worker sends data
   */
  const ondatacallback = ref<(data: unknown) => void>(() => {
  });
  /**
   * Define if the worker is finished
   */
  const isRunning = computed(() => status.value !== null && status.value !== 'init' && status.value !== 'finished' && status.value !== 'error');

  // Lazy load the worker when needed
  const workerPromise = new Promise<Worker>((resolve) => {
    import('./llm.worker.js?worker').then((WorkerModule) => {
       
      worker.value = new WorkerModule.default();
      resolve(worker.value);
    });
  });

  /**
   * Initialize a worker with a task.
   * This does not need to be called manually if the task is passed to the composable.
   * After the worker is created, it can be started with `worker.exec(data)`
   *
   * @Example
   * ```
   * const worker = useLTf()
   * worker.createWorker('summarization')
   * ...
   * ```
   *
   * @returns The id of the worker
   * @param newTask
   */
  async function createWorker(newTask: LlmTask) {
    status.value = 'init';
    const name = `${newTask}-${Math.random().toString(36).substring(7)}`;
    trackEvent('createWorker', { task: newTask });

    await workerPromise;
    if (worker.value === null) {
      trackEvent('workerError', { task: newTask, error: 'Worker not found' });
      return '';
    }

    workerTask.value = newTask;
    worker.value.onmessage = (event) => {
      const workerMessage = event.data;
      status.value = workerMessage.status;
      onmessage.value(event);

      if (workerMessage.type === 'download') {
        status.value = 'download';
        const workerData = workerMessage.data;
        const modelName = workerData.name + workerData.file;

        if (!downloads.value[modelName]) {
          trackEvent('workerDownload', { task: newTask, model: modelName });
          downloads.value[modelName] = 0;
        }

        if (downloads.value[modelName] < workerData.progress) {
          downloads.value[modelName] = workerData.progress;
        }
      } else if (workerMessage.type === 'update') {
        status.value = 'process';
        trackEvent('workerProgress', { task: newTask, data: workerMessage.data });
        data.value = workerMessage.data;
        ondatacallback.value(workerMessage.data);
      } else if (workerMessage.type === 'error') {
        trackEvent('workerError', { task: newTask, error: workerMessage.error });
        status.value = 'error';
      } else if (workerMessage.type === 'result') {
        trackEvent('workerUpdate', { task: newTask, data: workerMessage.data });
        status.value = 'finished';
        result.value = workerMessage.data;
      }
    };
    worker.value.onerror = (event) => {
      trackEvent('workerError', { task: newTask, error: event });
    };
    worker.value.onmessageerror = (event) => {
      trackEvent('workerMessageError', { task: newTask, error: event });
    };

    // Set worker id
    workerId.value = name;

    // Create a message channel
    channel.value = new MessageChannel();

    return worker.value;
  }

  /**
   * Terminate the worker
   */
  function removeWorker() {
    const removeWorkerStatus = false;
    if (worker.value !== null && channel.value !== null) {
      worker.value.terminate();
      channel.value.port1.close();
    } else {
      trackEvent('workerRemoved', { id: workerId.value, error: 'Worker not found' });
    }

    if (removeWorkerStatus) {
      trackEvent('workerRemoved', { id: workerId.value, error: 'Failed to terminate worker' });
    } else {
      trackEvent('workerRemoved', { id: workerId.value, error: 'Failed to terminate worker' });
    }

    return removeWorkerStatus;
  }

  /**
   * Start a task with the worker
   * @param taskData
   */
  async function exec(taskData: unknown) {
    await createWorker(task);
    trackEvent('workerStart', { id: workerId.value, data: taskData });
    if (worker.value !== null && channel.value !== null) {
      trackEvent('workerStarted', { id: workerId.value, data: taskData });
      worker.value.postMessage({ task: workerTask.value, data: taskData });
    } else {
      trackEvent('workerNotFound', { id: workerId.value });
    }
  }

  function cleanText(text: string) {
    // Trim, remove excessive spaces, and handle consecutive dots in one step
    let cleanedText = text.replace(/\s+/g, ' ').trim().replace(/\.{2,}/g, '.');

    // Remove dots at the beginning or end
    cleanedText = cleanedText.replace(/^\.+|\.+$/g, '');

    // Capitalize the first letter after every period, exclamation mark, or question mark
    cleanedText = cleanedText.replace(/([.!?])\s*([a-z])/g, (_, p1, p2) => `${p1} ${p2.toUpperCase()}`);

    // Ensure a period at the end if not present
    if (cleanedText && cleanedText[cleanedText.length - 1] !== '.') {
      cleanedText += '.';
    }

    // Prevent very short summaries
    if (cleanedText.split(' ').length <= 2) {
      return ''; // Or a default message like 'Summary too short'
    }

    // Check for incomplete sentences and adjust if needed
    if (/(\bthe\b|\bthis\b|\ban?\s\w+)\.$/.test(cleanedText)) {
      cleanedText = cleanedText.replace(/(\bthe\b|\bthis\b|\ban?\s\w+)\.$/, '.');
    }

    return cleanedText;
  }

  return {
    createWorker,
    exec,
    removeWorker,
    downloads,
    downloadProgress,
    workerId,
    onmessage,
    ondatacallback,
    isRunning,
    status,
    message,
    data,
    result,
    cleanedData,
  };
}
