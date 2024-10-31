// Ollama Restful API document
// https://github.com/ollama/ollama/blob/main/docs/api.md

// Ollama OpenAI-like API document
// https://github.com/ollama/ollama/blob/main/docs/openai.md

// Model list
// qwen2.5-coder:7b-instruct: https://ollama.com/library/qwen2.5-coder:7b-instruct
// codellama:7b-code: https://ollama.com/library/codellama:7b-code
// llama3.2:3b: https://ollama.com/library/llama3.2:3b

// Reference
// https://ollama.com/blog/how-to-prompt-code-llama

import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import axios, { AxiosInstance } from 'axios';

export interface FunctionInfo {
  name: string;
  parameters: string[];
  returnType: string | null;
}

@Injectable()
export class OllamaService {
  private ollamaUrl: string;
  private ollamaModel: string;
  client: AxiosInstance;

  private readonly logger = new Logger(OllamaService.name);

  public readonly model_qwen: string = 'qwen2.5-coder';
  public readonly model_codellamaInfill: string = 'codellama:7b-code';

  // For testcase or code review: bug suggestion
  public readonly model_codellama: string = 'codellama';

  // Enum
  public readonly code_review: string = 'code_review';
  public readonly testcase_suggestion: string = 'testcase_suggestion';

  constructor(private readonly httpService: HttpService) {
    // Check if the environment variables are set
    if (!process.env.OLLAMA_ENDPOINT) {
      throw new Error('OLLAMA_ENDPOINT is not set');
    }
    if (!process.env.OLLAMA_MODEL) {
      throw new Error('OLLAMA_MODEL is not set');
    }

    this.ollamaUrl = process.env.OLLAMA_ENDPOINT;
    this.ollamaModel = process.env.OLLAMA_MODEL;
    this.logger.debug(
      `Ollama URL: ${this.ollamaUrl}, Model: ${this.ollamaModel}`,
    );

    // Create a new Axios instance
    this.client = axios.create({
      baseURL: this.ollamaUrl,
    });
  }

  // Call /api/generate
  async callGenerate(prompt: string): Promise<string> {
    const response = await this.client.post<{
      response: string;
    }>('/api/generate', {
      model: this.ollamaModel,
      prompt: prompt,
      stream: false,
    });
    // Example response format
    // from https://github.com/ollama/ollama/blob/main/docs/api.md#response-1
    // {
    //   "model": "llama3.2",
    //   "created_at": "2023-08-04T19:22:45.499127Z",
    //   "response": "The sky is blue because it is the color of the sky.",
    //   "done": true,
    //   "context": [1, 2, 3],
    //   "total_duration": 5043500667,
    //   "load_duration": 5025959,
    //   "prompt_eval_count": 26,
    //   "prompt_eval_duration": 325953000,
    //   "eval_count": 290,
    //   "eval_duration": 4709213000
    // }
    // console.log(response.data.response);
    return response.data.response;
  }

  async callLlama(prompt: string): Promise<any> {
    const response = await this.httpService
      .post(`${this.ollamaUrl}/completions`, {
        model: this.ollamaModel, //'llama3.2',//'codellama',
        prompt: prompt,
      })
      .toPromise();
    return response.data;
  }

  //to for unit test or code review
  async callForUnitTestOrCodeReview(
    code: string,
    reviewType: string,
  ): Promise<any> {
    let prompt = '';
    if (reviewType == this.code_review) {
      prompt = this.constructCodeReviewPrompt(code);
    } else {
      prompt = this.constructUnitTestPrompt(code);
    }
    console.log(prompt);
    const response = await this.httpService
      .post(`${this.ollamaUrl}/completions`, {
        model: this.model_codellama, //'llama3.2',//'codellama',
        prompt: prompt,
      })
      .toPromise();
    return response.data;
  }

  async callGivePythonCodeSuggestion(
    FunctionInfo: FunctionInfo,
    SelectModule: string,
  ): Promise<any> {
    const prompt = this.constructPythonInfillPrompt(FunctionInfo, SelectModule);
    console.log(prompt);
    return this.callForCodeInfill(prompt, SelectModule);
  }

  constructCodeReviewPrompt(code: string): string {
    return 'Where is the bug in this code? \r\n\r\n ' + code;
  }

  constructUnitTestPrompt(code: string): string {
    return 'Write a unit test for this function: ' + code;
  }

  constructPythonInfillPrompt(
    FunctionInfo: FunctionInfo,
    SelectModule: string,
  ): any {
    let result = '';
    if (SelectModule == this.model_qwen) {
      //pending to implement
    } else {
      result = '<PRE> def ' + FunctionInfo['name'];
      result = result + '(' + FunctionInfo['parameters'] + '):' + '<SUF> ';

      if (FunctionInfo['returnType'] != null)
        result = result + 'return ' + FunctionInfo['returnType'];

      result = result + ' <MID>';
    }
    return result;
  }

  // Perform Code Infill
  async callForCodeInfill(prompt: string, SelectModule: string): Promise<any> {
    let model = '';
    if (SelectModule == this.model_qwen) model = this.model_qwen;
    else model = this.model_codellamaInfill;
    console.log(model);
    const response = await this.httpService
      .post(`${this.ollamaUrl}/completions`, {
        model: model, //'llama3.2',//'codellama',
        prompt: prompt,
      })
      .toPromise();
    return response.data;
  }
}
