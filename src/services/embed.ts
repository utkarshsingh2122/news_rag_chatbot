import axios from 'axios';
import { cfg } from '../config';

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const { data } = await axios.post('https://api.jina.ai/v1/embeddings', {
    model: cfg.jinaModel, input: texts
  }, { headers: { Authorization: `Bearer jina_4d820adf6268483fa43163160d72a8aeLFE4SDVXw2fFomgo-VPC8zE9d08I` }});
  return data.data.map((d: any) => d.embedding);
}
