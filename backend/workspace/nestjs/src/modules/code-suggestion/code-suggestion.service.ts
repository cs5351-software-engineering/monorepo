import { Injectable } from '@nestjs/common';
import { execSync } from 'child_process';

import * as ts from 'typescript';
import * as fs from 'fs';
//as path is used as function parameter, i.e.: change to "pathLib"
import * as pathLib from 'path';
import { promisify } from 'util';

const writeFileAsync = promisify(fs.writeFile);

import { FunctionInfo, OllamaService } from '../ollama/ollama.service';

export interface FileSuggestion {
  sourceFilePath: string;
  targetFilePath: string;
  codeSuggestion: CodeSuggestion[];
}

export interface CodeSuggestion {
  function: string;
  suggestion: string;
}

@Injectable()
export class CodeSuggestionService {
  constructor(private readonly ollamaService: OllamaService) {}

  extractFunctionInfo(filePath: string): FunctionInfo[] {
    console.log(filePath);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    console.log(fileContents);
    const sourceFile = ts.createSourceFile(
      'tempFile.ts',
      fileContents,
      ts.ScriptTarget.Latest,
      true,
    );

    const functions: FunctionInfo[] = [];
    function visit(node: ts.Node) {
      //isFunctionDeclaration: only support TypeScript and JavaScript code
      if (ts.isFunctionDeclaration(node) && node.name) {
        const funcName = node.name.getText();
        const parameters = node.parameters.map((param) => param.name.getText());
        const returnType = node.type ? node.type.getText() : null;
        functions.push({ name: funcName, parameters, returnType });
      }
      ts.forEachChild(node, visit);
    }
    visit(sourceFile);
    return functions;
  }

  getPythonFunctionDef(filePath: string): any {
    const command = `python3 parser_getFunctionDef.py ${filePath}`;
    const output = execSync(command);

    const data = JSON.parse(output.toString());
    const functions: FunctionInfo[] = [];

    data.forEach((element) => {
      const funcName = element['name'];
      const parameters = element['parameters'];
      const returnType = element['returnType'];
      functions.push({ name: funcName, parameters, returnType });
    });

    return functions;
  }

  getPythonFunctionContentList(filePath: string): any {
    const functionsContentList: string[] = [];

    const command = `python3 parser_getFunctionContent.py ${filePath}`;
    const output = execSync(command);
    const data = JSON.parse(output.toString());
    let i = 0;
    let funct_attribute_name = '';
    for (const element of data) {
      funct_attribute_name = 'funct_' + i.toString();
      functionsContentList.push(element[funct_attribute_name]);
      i++;
    }
    return functionsContentList;
  }

  async getCodeSuggestion(
    ollamaService: OllamaService,
    path: string,
  ): Promise<FileSuggestion[]> {
    let filePathList: string[] = [];
    const fileSuggestionList: FileSuggestion[] = [];

    const stat = fs.statSync(path);
    if (stat.isDirectory()) filePathList = this.getFilePath(path);
    else filePathList.push(path);

    for (const sourceFilePath of filePathList) {
      const codeReviewList: CodeSuggestion[] = [];
      try {
        const functionList =
          CodeSuggestionService.prototype.getPythonFunctionDef(sourceFilePath);
        console.log(functionList);
        const codeSuggestionList: string[] = [];
        console.log(codeSuggestionList);
        for (const element of functionList) {
          const suggestedCode =
            await ollamaService.callGivePythonCodeSuggestion(
              element,
              Model.codellama_7b_code,
            );
          const suggestion: CodeSuggestion = {
            function: element,
            suggestion: suggestedCode['choices'][0]['text'],
          };
          codeReviewList.push(suggestion);
        }
        const updateTargetPath: string = this.getTargetPath(
          sourceFilePath,
          '_infill',
        );
        console.log('path:', path);
        console.log('source path:', sourceFilePath);
        console.log('updateTargetPath:', updateTargetPath);
        const fileSuggestion: FileSuggestion = {
          sourceFilePath: sourceFilePath,
          targetFilePath: updateTargetPath,
          codeSuggestion: codeReviewList,
        };
        fileSuggestionList.push(fileSuggestion);
      } catch {
        //do nothing: cannot provide infill function as we cannot define function name, parameter, and return type
      }
    }

    return fileSuggestionList;
  }

  async getCodeReview(
    ollamaService: OllamaService,
    filePath: string,
  ): Promise<FileSuggestion[]> {
    return this.getCodeReviewOrTestCase(
      ollamaService,
      filePath,
      ollamaService.code_review,
    );
  }

  async getTestCase(
    ollamaService: OllamaService,
    filePath: string,
  ): Promise<FileSuggestion[]> {
    return this.getCodeReviewOrTestCase(
      ollamaService,
      filePath,
      ollamaService.testcase_suggestion,
    );
  }

  getFilePath(dir: string): string[] {
    let filePathList: string[] = [];
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
      const filePath = pathLib.join(dir, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        const tempfilePathList = this.getFilePath(filePath);
        filePathList = [...filePathList, ...tempfilePathList];
      } else if (stats.isFile()) {
        filePathList.push(filePath);
      }
    });
    return filePathList;
  }

  async getCodeReviewOrTestCase(
    ollamaService: OllamaService,
    path: string,
    reviewType: string,
  ) {
    let filePathList: string[] = [];
    const fileSuggestionList: FileSuggestion[] = [];

    const stat = fs.statSync(path);
    if (stat.isDirectory()) filePathList = this.getFilePath(path);
    else filePathList.push(path);

    for (const sourceFilePath of filePathList) {
      const codeReviewList: CodeSuggestion[] = [];
      let functionContentList: string[] = [];

      // Parsing Python AST
      try {
        console.log('Get Python content:', sourceFilePath);
        functionContentList =
          CodeSuggestionService.prototype.getPythonFunctionContentList(
            sourceFilePath,
          );
      } catch {
        // if cannot get content information, pass whole file content
        console.log('Get Python content: failed');
        functionContentList.push(fs.readFileSync(sourceFilePath, 'utf8'));
      }
      console.log(functionContentList);

      //console.log(codeReviewList);
      for (const element of functionContentList) {
        const suggestedCode = await ollamaService.callForUnitTestOrCodeReview(
          element,
          reviewType,
        );
        const suggestion: CodeSuggestion = {
          function: element,
          suggestion: suggestedCode['choices'][0]['text'],
        };
        codeReviewList.push(suggestion);
      }

      const updateTargetPath: string = this.getTargetPath(
        sourceFilePath,
        reviewType,
      );
      console.log('path:', path);
      console.log('source path:', sourceFilePath);
      console.log('updateTargetPath:', updateTargetPath);
      const fileSuggestion: FileSuggestion = {
        sourceFilePath: sourceFilePath,
        targetFilePath: updateTargetPath,
        codeSuggestion: codeReviewList,
      };
      fileSuggestionList.push(fileSuggestion);
    }
    return fileSuggestionList;
  }

  getTargetPath(sourceFilePath: string, suffix: string): string {
    const directoryPath: string = pathLib.dirname(sourceFilePath);
    const fileName: string = pathLib.basename(sourceFilePath);
    return pathLib.join(directoryPath, suffix, fileName);
  }

  getCodeSuggestionContent(CodeSuggestionList: CodeSuggestion[]) {
    let content = '';
    let i: number = 1;
    CodeSuggestionList.forEach((element) => {
      content = content + '\r\n';
      content =
        content +
        '*** Function Suggestion (' +
        i.toString() +
        '): start ***\r\n';
      content = content + '*** Original Function ***\r\n';
      content = content + element.function.toString() + '\r\n';
      content =
        content + '***----------------------------------------------***\r\n';
      content = content + '*** Suggestion ***\r\n';
      content = content + element.suggestion.toString() + '\r\n';
      content =
        content + '*** Function Suggestion (' + i.toString() + '): end ***\r\n';
      content =
        content +
        '**************************************************\r\n\r\n\r\n';
      i++;
    });
    if (content == '') content = 'No Suggestion!';
    return content;
  }

  async startCodeReview(path: string) {
    const fileSuggestionList: FileSuggestion[] = await this.getCodeReview(
      this.ollamaService,
      path,
    );

    for (const fileSuggestion of fileSuggestionList) {
      const fileContent: string = this.getCodeSuggestionContent(
        fileSuggestion.codeSuggestion,
      );
      const directoryPath: string = pathLib.dirname(
        fileSuggestion.targetFilePath,
      );
      if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath);
        console.log('Directory created!');
      }
      await writeFileAsync(fileSuggestion.targetFilePath, fileContent);
    }
    return fileSuggestionList;
  }

  async startGetTestCase(path: string) {
    const fileSuggestionList: FileSuggestion[] = await this.getTestCase(
      this.ollamaService,
      path,
    );
    for (const fileSuggestion of fileSuggestionList) {
      const fileContent: string = this.getCodeSuggestionContent(
        fileSuggestion.codeSuggestion,
      );
      const directoryPath: string = pathLib.dirname(
        fileSuggestion.targetFilePath,
      );
      if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath);
        console.log('Directory created!');
      }
      await writeFileAsync(fileSuggestion.targetFilePath, fileContent);
    }
    return fileSuggestionList;
  }

  async startCodeInfill(path: string) {
    const fileSuggestionList: FileSuggestion[] = await this.getCodeSuggestion(
      this.ollamaService,
      path,
    );
    for (const fileSuggestion of fileSuggestionList) {
      const fileContent: string = this.getCodeSuggestionContent(
        fileSuggestion.codeSuggestion,
      );
      const directoryPath: string = pathLib.dirname(
        fileSuggestion.targetFilePath,
      );
      if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath);
        console.log('Directory created!');
      }
      await writeFileAsync(fileSuggestion.targetFilePath, fileContent);
    }
    return fileSuggestionList;
  }
}
