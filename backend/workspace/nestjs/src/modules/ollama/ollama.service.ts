//https://ollama.com/blog/how-to-prompt-code-llama
//https://ollama.com/library/qwen2.5-coder
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

export interface FunctionInfo {
  name: string;
  parameters: string[];
  returnType: string | null;
}

@Injectable()
export class OllamaService {
  private readonly ollamaUrl = process.env.OLLAMA_ENDPOINT; //http://localhost:11434/v1

  public readonly model_qwen: string = "qwen2.5-coder"
  public readonly model_codellamaInfill: string = "codellama:7b-code"
  //for testcase or code review: bug suggestion
  public readonly model_codellama: string = "codellama"
  
  public readonly code_review: string ="code_review"
  public readonly testcase_suggestion: string ="testcase_suggestion"

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

  //to for unit test or code review
  async callForUnitTestOrCodeReview(code: string, reviewType: string ): Promise<any> {
    var prompt = ''
    if (reviewType == this.code_review) {
      prompt = this.constructCodeReviewPrompt(code)
    }
    else {
      prompt = this.constructCodeReviewPrompt(code)
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

  async callGivePythonCodeSuggestion(FunctionInfo: FunctionInfo, SelectModule: string): Promise<any> {
    const prompt = this.constructPythonInfillPrompt(FunctionInfo, SelectModule)
    console.log(prompt)
    return this.callForCodeInfill(prompt, SelectModule)
  }

  constructCodeReviewPrompt(code: string): string {
    return "Where is the bug in this code? \r\n\r\n " + code
  }

  constructUnitTestPrompt(code: string): string {
    return "write a unit test for this function: " + code
  }


  constructPythonInfillPrompt(FunctionInfo: FunctionInfo, SelectModule: string): any {
    var result =''
    if (SelectModule == this.model_qwen)
    {
      //pending to implement
    }
    else{
      result = '<PRE> def ' + FunctionInfo['name'];
      result = result + '(' + FunctionInfo['parameters'] + '):' + '<SUF> ';
      
      if (FunctionInfo['returnType'] != null)
          result = result + 'return ' + FunctionInfo['returnType'];

      result = result + ' <MID>'
    }
    return result;
  }

  //for model to perform Code Infill
  async callForCodeInfill(prompt: string, SelectModule: string): Promise<any> {
    let model = '';
    if (SelectModule == this.model_qwen)
      model = this.model_qwen 
    else
      model = this.model_codellamaInfill
    console.log(model)
    const response = await this.httpService
      .post(`${this.ollamaUrl}/completions`, {
        model: model, //'llama3.2',//'codellama',
        prompt: prompt,
      })
      .toPromise();
    return response.data;
  }
}
