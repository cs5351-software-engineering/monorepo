import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class OllamaService {
  private readonly ollamaUrl = process.env.OLLAMA_ENDPOINT; //http://localhost:11434/v1

  constructor(private readonly httpService: HttpService) {}

  async callLlama(prompt: string): Promise<any> {
    const response = await this.httpService
      .post(`${this.ollamaUrl}/completions`, {
        model: process.env.OLLAMA_MODEL, //'llama3.2',//'codellama',
        prompt: prompt,
      })
      .toPromise();
    return response.data;
  }
}
