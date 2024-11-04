/* eslint-disable no-restricted-globals */
/* eslint-disable @typescript-eslint/no-shadow */
/**
 * Thanks to the Jina team for providing the code for the Local Transformers text classification pipeline
 * Thanks to @xenova for the transformers package
 *
 * https://huggingface.co/jinaai/jina-reranker-v1-tiny-en
 */

import { AutoModelForSequenceClassification, AutoTokenizer } from '@xenova/transformers';

const modelId = 'jinaai/jina-reranker-v1-tiny-en';
let ranker;
let tokenizer;

/**
 * Get the Local Transformers text classification pipeline
 * @param progressCallback
 */
async function getRanker(progressCallback) {
  if (!ranker) {
    tokenizer = await AutoTokenizer.from_pretrained(modelId);
    ranker = await AutoModelForSequenceClassification.from_pretrained(modelId, {
      quantized: false,
      progress_callback: progressCallback,
    });
  }
  return ranker;
}

/**
 * Sorts texts based on their importance using the Local Transformers text classification pipeline
 * @param data an object containing the query and the data to be ranked
 * @param progressCallback a callback function to report progress
 */
async function getLTfDocumentRanking(data, progressCallback) {
  console.log('Ranking data:', data);
  const ranker = await getRanker(progressCallback);
  const { query, documents } = data;
  const { topK, returnDocuments } = { topK: 5, returnDocuments: true };

  const inputs = tokenizer(
    new Array(documents.length).fill(query),
    { text_pair: documents, padding: true, truncation: true },
  );

  const { logits } = await ranker(inputs);
  const results = logits
    .sigmoid()
    .tolist()
    .map((score, i) => ({
      corpus_id: i,
      score,
      ...(returnDocuments ? { text: documents[i] } : {}),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  console.log('Sorted documents:', results);

  return results;
}

self.addEventListener('message', async (event) => {
  console.log('LTf.rank.worker', event.data);
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

        const sorting = await getLTfDocumentRanking(data, progressCallback);
        self.postMessage({ type: 'finished', data: sorting });
      } catch (error) {
        console.error('Error in LTf.rank.worker', error);
        self.postMessage({ type: 'error', error });
      }
      break;
    default:
      console.error('Unknown message type in LTf.rank.worker', workerData.type);
      break;
  }
});
