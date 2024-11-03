/* eslint-disable no-restricted-globals */
/* eslint-disable @typescript-eslint/no-shadow */
/**
 * Thanks to @xenova for the transformer package
 *
 * https://github.com/xenova
 */
import { pipeline, env } from '@xenova/transformers';

let generator;
const modelId = 'Xenova/distilbart-xsum-6-6';
const task = 'summarization';

env.allowLocalModels = false;
env.useBrowserCache = true;

/**
 * Get the Local Transformers summarization pipeline
 * @param progressCallback
 */
async function getGenerator(progressCallback) {
  if (!generator) {
    generator = await pipeline(task, modelId, {
      quantized: true,
      progress_callback: progressCallback,
    });
  }
  return generator;
}

/**
 * Get a summary of the given text using the Local Transformers summarization pipeline
 * @param text the text to summarize
 * @param progressCallback a callback function to report progress
 */
async function getLlmSummary(text, progressCallback) {
  const generator = await getGenerator(progressCallback);

  const config = {
    max_length: 25, // Allows more space for summarizing steps.
    min_length: 15, // Ensures sufficient output for clarity.
    do_sample: true, // Keeps output somewhat variable (useful if sampling).
    early_stopping: true, // Stops generation when an EOS token is generated.
    temperature: 0.7, // Reduces randomness for more controlled summaries.
    num_return_sequences: 1, // Only return the best summary.
    max_time: 15, // Reduces response time.
    top_k: 40, // Reduces token sampling range slightly for stability.
    top_p: 0.9, // Limits sampling to top 90% cumulative probability.
    num_beams: 3, // Fewer beams reduce computation while preserving quality.
    length_penalty: 0.5, // Slight penalty to avoid overly concise summaries.
    no_repeat_ngram_size: 3, // Prevents repeating any 3-gram for clarity.
  };

  const output = await generator(text, config);

  if (Array.isArray(output) && output.length > 0 && 'summary_text' in output[0]) {
    return output[0].summary_text;
  } if ('summary_text' in output) {
    return output.summary_text;
  }

  throw new Error('Unexpected output format from summarization pipeline');
}

self.addEventListener('message', async (event) => {
  const workerData = event.data;
  const { data } = workerData;
  switch (workerData.type) {
    case 'init':
      self.postMessage({ type: 'ready' });
      break;
    case 'data':
      try {
        const progressCallback = (status) => {
          self.postMessage({ type: 'progress', status });
        };

        const text = data;
        const summaries = await Promise.all(text.map((n) => getLlmSummary(n, progressCallback)));
        self.postMessage({ type: 'finished', data: summaries });
      } catch (error) {
        self.postMessage({ type: 'error', error });
        console.error(error);
      }
      break;
    default:
      break;
  }
});
