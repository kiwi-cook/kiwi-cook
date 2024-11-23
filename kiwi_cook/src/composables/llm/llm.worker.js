/* eslint-disable max-len */
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
    max_length: 70,
    min_length: 20,
    do_sample: true,
    early_stopping: true,
    temperature: 0.7, // Lower for more deterministic output
    num_return_sequences: 1,
    max_time: 30,
    top_k: 50,
    top_p: 0.9, // Slightly reduces randomness
    num_beams: 3, // Lower beams to balance speed and quality
    num_beam_groups: 3, // Reduce beam groups for efficiency
    length_penalty: 1.0,
    no_repeat_ngram_size: 3,
    use_cache: true, // Enabling cache improves efficiency
    stop_strings: ['\n', '?', ':', 'Ingredients', 'Instructions', 'ingredients', 'instructions'],
  };

  let pipelineData = '';
  pipelineData += 'Summarize the recipe focusing on the dish’s purpose and outcome:\n\n';
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
