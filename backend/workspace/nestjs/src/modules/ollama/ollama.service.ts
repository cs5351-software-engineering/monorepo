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
  body: string;
  returnType: string | null;
}

export enum Model {
  llama3_2_3b = 'llama3.2:3b',
  codellama_7b_code = 'codellama:7b-code',
  qwen2_5_coder_7b_instruct = 'qwen2.5-coder:7b-instruct',
  qwen2_5_coder_1_5b_instruct = 'qwen2.5-coder:1.5b-instruct',
}

export enum ReviewType {
  code_review = 'code_review',
  testcase_suggestion = 'testcase_suggestion',
}

@Injectable()
export class OllamaService {
  private ollamaUrl: string;
  private ollamaModel: Model;
  client: AxiosInstance;

  private readonly logger = new Logger(OllamaService.name);

  constructor(private readonly httpService: HttpService) {
    // Check if the environment variables are set
    if (!process.env.OLLAMA_ENDPOINT) {
      throw new Error('OLLAMA_ENDPOINT is not set');
    }
    if (!process.env.OLLAMA_MODEL) {
      throw new Error('OLLAMA_MODEL is not set');
    }

    // Initialize the Ollama URL and model
    this.ollamaUrl = process.env.OLLAMA_ENDPOINT;
    this.ollamaModel = this.convertStringToModel(process.env.OLLAMA_MODEL);
    this.logger.debug(
      `Ollama URL: ${this.ollamaUrl}, Model: ${this.ollamaModel}`,
    );

    // Create a new Axios instance
    this.client = axios.create({
      baseURL: this.ollamaUrl,
    });
  }

  // Convert string to Model enum
  // https://www.reddit.com/r/typescript/comments/gekbfj/convert_string_to_enum_values/
  private convertStringToModel(modelString: string): Model {
    const modelList = Object.values(Model);
    const model = modelList.find((ele) => modelString == ele);
    if (model === undefined) {
      throw new Error(
        `Invalid OLLAMA_MODEL ${modelString}, valid values are: ${modelList.join(', ')}`,
      );
    }
    return model;
  }

  // Call /api/generate
  async callGenerate(
    prompt: string,
    model: Model = this.ollamaModel,
  ): Promise<string> {
    const response = await this.client.post<{
      response: string;
    }>('/api/generate', {
      model: model,
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
    try {
      const response = await this.httpService
        .post(`${this.ollamaUrl}/v1/completions`, {
          model: this.ollamaModel, //'llama3.2',//'codellama',
          prompt: prompt,
        })
        .toPromise();
      return response.data;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  //to for unit test or code review
  async callForUnitTestOrCodeReview(
    code: string,
    reviewType: ReviewType,
  ): Promise<any> {
    let prompt = '';
    if (reviewType == ReviewType.code_review) {
      prompt = this.constructCodeReviewPrompt(code);
    } else {
      prompt = this.constructUnitTestPrompt(code);
    }
    console.log(prompt);
    try {
      const response = await this.httpService
        .post(`${this.ollamaUrl}/v1/completions`, {
          model: Model.codellama_7b_code, //'llama3.2',//'codellama',
          prompt: prompt,
        })
        .toPromise();
      return response.data;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async callGivePythonCodeSuggestion(
    FunctionInfo: FunctionInfo,
    SelectModule: Model,
  ): Promise<any> {
    const prompt = this.constructPythonInfillPrompt(FunctionInfo, SelectModule);
    console.log(prompt);
    return this.callForCodeInfill(prompt, SelectModule);
  }

  constructCodeReviewPrompt(code: string): string {
    // Improved prompt for code review
    return (
      'Please review the following code and identify any bugs or potential issues:\n\n' +
      code
    );
  }

  constructUnitTestPrompt(code: string): string {
    // Improved prompt for unit test generation
    return (
      'Please write a comprehensive unit test for the following function:\n\n' +
      code
    );
  }

  constructPythonInfillPrompt(
    FunctionInfo: FunctionInfo,
    SelectModule: Model,
  ): any {
    let result = '';
    if (SelectModule == Model.qwen2_5_coder_7b_instruct) {
      // Pending to implement
      throw new Error('Not implemented');
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
  async callForCodeInfill(prompt: string, SelectModule: Model): Promise<any> {
    let model = '';
    if (SelectModule == Model.qwen2_5_coder_7b_instruct)
      model = Model.qwen2_5_coder_7b_instruct;
    else model = Model.codellama_7b_code;
    console.log(model);
    const response = await this.httpService
      .post(`${this.ollamaUrl}/v1/completions`, {
        model: model, //'llama3.2',//'codellama',
        prompt: prompt,
      })
      .toPromise();
    return response.data;
  }
}
