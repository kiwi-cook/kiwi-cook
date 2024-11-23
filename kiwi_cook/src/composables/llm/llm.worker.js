/* eslint-disable no-restricted-globals */
/**
 * Thanks to @xenova for the transformer package
 *
 * https://github.com/xenova
 */
import { pipeline, env } from '@xenova/transformers';

env.allowLocalModels = false;
env.useBrowserCache = true;
env.backends.onnx.wasm.proxy = true;

class PipelineFactory {
  static task = null;

  static quantized = true;

  static model = null;

  // NOTE: instance stores a promise that resolves to the pipeline
  static instance = null;

  constructor(tokenizer, model) {
    this.tokenizer = tokenizer;
    this.model = model;
  }

  /**
   * Get pipeline instance
   * @param {*} progressCallback
   * @returns {Promise}
   */
  static getInstance(progressCallback = null) {
    if (this.task === null || this.model === null) {
      throw Error('Must set task and model');
    }
    if (this.instance === null) {
      this.instance = pipeline(this.task, this.model, {
        quantized: this.quantized,
        progress_callback: progressCallback,
      });
    }

    return this.instance;
  }
}

class SummarizationPipelineFactory extends PipelineFactory {
  static task = 'text2text-generation';

  static quantized = true;

  static model = 'Xenova/flan-alpaca-base';
}

async function summarize(data) {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const summaryPipeline = await SummarizationPipelineFactory.getInstance((data) => {
    self.postMessage({
      type: 'download',
      task: 'summarization',
      data,
    });
  });

  const config = {
    max_length: 65, // Keeps summaries short and to the point.
    min_length: 40, // Ensures summaries aren't too short.
    do_sample: true,
    early_stopping: true, // Stop as soon as the model generates a coherent summary.
    temperature: 0.7, // A balanced temperature for focused output without too much randomness.
    num_return_sequences: 1,
    max_time: 30, // Time constraint for quicker processing.
    top_k: 60, // Restricts token selection to top 50 for clarity.
    top_p: 0.80, // Allows for some diversity but keeps most of the focus.
    num_beams: 5, // A good balance for exploring options while generating output quickly.
    length_penalty: 1.5, // Neutral length penalty for clear, concise summaries.
    no_repeat_ngram_size: 3, // Prevents repetition of n-grams (e.g., phrases or words).
    use_cache: true, // Cache previous computations for faster processing.
  };

  let pipelineData = '';
  // eslint-disable-next-line max-len
  pipelineData += 'Summarize this recipe by highlighting the dish’s purpose, main ingredients, and expected outcome. Do not repeat text or list individual steps:\n';
  pipelineData += data.data;

  return summaryPipeline(pipelineData, {
    ...config,
    callback_function(beams) {
      if (beams && beams.length > 0) {
        const decodedText = summaryPipeline.tokenizer.decode(beams[0].output_token_ids, {
          skip_special_tokens: true,
        });

        // Send back the updated summary
        self.postMessage({
          type: 'update',
          data: decodedText.trim(),
        });
      } else {
        self.postMessage({
          type: 'error',
          error: 'No beams generated',
        });
      }
    },
  });
}

const TASK_FUNCTION_MAPPING = {
  summarization: summarize,
};

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
  const { data } = event;
  const fn = TASK_FUNCTION_MAPPING[data.task];

  if (!fn) return;

  try {
    const result = await fn(data);
    self.postMessage({
      task: data.task,
      type: 'result',
      data: result,
    });
  } catch (error) {
    self.postMessage({
      task: data.task,
      type: 'error',
      error,
    });
  }
});
