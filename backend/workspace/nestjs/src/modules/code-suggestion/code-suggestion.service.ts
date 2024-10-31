import { Injectable } from '@nestjs/common';
import { execSync } from 'child_process';
// import * as ts from 'typescript';
import * as fs from 'fs';
import * as pathLib from 'path';
import { promisify } from 'util';
import {
  FunctionInfo,
  OllamaService,
  ReviewType,
} from '../ollama/ollama.service';
import { MinioService } from '../file/minio/minio.service';
import { Project } from '../project/project.entity';
import { Model } from '../ollama/ollama.service';

// Define file suggestion and code suggestion
export interface FileSuggestion {
  sourceFilePath: string;
  targetFilePath: string;
  codeSuggestion: CodeSuggestion[];
}

// Define code suggestion
export interface CodeSuggestion {
  function: string;
  suggestion: string;
}

// Define write file async
const writeFileAsync = promisify(fs.writeFile);

@Injectable()
export class CodeSuggestionService {
  constructor(
    private readonly ollamaService: OllamaService,
    private readonly minioService: MinioService,
  ) {}

  // Analyze codebase
  async analyzeCodebase(project: Project) {
    // Download project codebase from minio
    let tempFolderPath =
      await this.minioService.downloadCodebaseToTemp(project);
    tempFolderPath = tempFolderPath.replace(/\\/g, '/');
    // console.log(`tempFolderPath: ${tempFolderPath}`);

    // Get all .py files from path
    const pyFiles = this.getAllPythonFilesUnderFolder(tempFolderPath);
    // console.log(
    //   `pyFiles: ${pyFiles.map((file) => file.parentPath + '/' + file.name)}`,
    // );

    // Mapping to python function info
    const pyFuncInfoDict: { [path: string]: FunctionInfo[] } = {};
    for (const file of pyFiles) {
      let absolutePath = file.parentPath + '/' + file.name;
      absolutePath = absolutePath.replace(/\\/g, '/');
      const relativePath = absolutePath
        .replace(tempFolderPath, '')
        .substring(1);
      // console.log(`absolutePath: ${absolutePath}`);
      // console.log(`relativePath: ${relativePath}`);
      pyFuncInfoDict[relativePath] = this.getPythonFunctionInfo(absolutePath);
    }
    // console.log(pyFuncInfoDict);

    // Mapping to code review and test case suggestion
    const resultDict: {
      [path: string]: {
        codeReview: string;
        testCaseSuggestion: string;
      }[];
    } = {};

    for (const [path, functionInfoList] of Object.entries(pyFuncInfoDict)) {
      console.log(`Ollama analyze path: ${path}`);

      const functionCodeReviewAndTestCaseSuggestionList: {
        codeReview: string;
        testCaseSuggestion: string;
      }[] = [];
      for (const functionInfo of functionInfoList) {
        functionCodeReviewAndTestCaseSuggestionList.push({
          ...functionInfo,
          codeReview: await this.getPythonCodeReview(functionInfo),
          testCaseSuggestion:
            await this.getPythonTestCaseSuggestion(functionInfo),
        });
      }
      resultDict[path] = functionCodeReviewAndTestCaseSuggestionList;
    }
    // console.log(resultDict);

    return resultDict;
  }

  // Get all python files under folder
  getAllPythonFilesUnderFolder(path: string) {
    return fs
      .readdirSync(path, { recursive: true, withFileTypes: true })
      .filter(
        (file) =>
          file.isFile() &&
          file.name.endsWith('.py') &&
          file.name != '__init__.py',
      );
  }

  // Get python function definition
  getPythonFunctionInfo(filePath: string) {
    const command = `python parsePythonFunctionInfo.py ${filePath}`;
    const buffer = execSync(command);
    const output = buffer.toString();
    const result: FunctionInfo[] = JSON.parse(output);
    return result;
  }

  // Get python code review
  async getPythonCodeReview(pythonFunctionInfo: FunctionInfo) {
    const prompt = `Please provide a code review or any improvement for the following python function:
\`\`\`python
${pythonFunctionInfo.body}
\`\`\`

Result only contains code review or improvement, no other information
If it is not suitable for code review or improvement, please return "Not suitable"`;
    const result = await this.ollamaService.callGenerate(
      prompt,
      Model.qwen2_5_coder_1_5b_instruct,
    );
    return result;
  }

  // Get python test case suggestion
  async getPythonTestCaseSuggestion(pythonFunctionInfo: FunctionInfo) {
    const prompt = `Please provide a test case or unit test for the following python function:
\`\`\`python
${pythonFunctionInfo.body}
\`\`\`

Result only contains test case or unit test, no other information
If it is not suitable for generating test case or unit test, like it is not a function, please return "Not suitable"`;
    const result = await this.ollamaService.callGenerate(
      prompt,
      Model.qwen2_5_coder_1_5b_instruct,
    );
    return result;
  }

  // extractFunctionInfo(filePath: string): FunctionInfo[] {
  //   console.log(filePath);
  //   const fileContents = fs.readFileSync(filePath, 'utf8');
  //   console.log(fileContents);
  //   const sourceFile = ts.createSourceFile(
  //     'tempFile.ts',
  //     fileContents,
  //     ts.ScriptTarget.Latest,
  //     true,
  //   );

  //   const functions: FunctionInfo[] = [];
  //   function visit(node: ts.Node) {
  //     //isFunctionDeclaration: only support TypeScript and JavaScript code
  //     if (ts.isFunctionDeclaration(node) && node.name) {
  //       const funcName = node.name.getText();
  //       const parameters = node.parameters.map((param) => param.name.getText());
  //       const returnType = node.type ? node.type.getText() : null;
  //       functions.push({ name: funcName, parameters, returnType });
  //     }
  //     ts.forEachChild(node, visit);
  //   }
  //   visit(sourceFile);
  //   return functions;
  // }

  // getPythonFunctionDef(filePath: string): any {
  //   const command = `python parser_getFunctionDef.py ${filePath}`;
  //   const output = execSync(command);

  //   const data = JSON.parse(output.toString());
  //   const functions: FunctionInfo[] = [];

  //   data.forEach((element) => {
  //     const funcName = element['name'];
  //     const parameters = element['parameters'];
  //     const returnType = element['returnType'];
  //     functions.push({ name: funcName, parameters, returnType });
  //   });

  //   return functions;
  // }

  // getPythonFunctionContentList(filePath: string): any {
  //   const functionsContentList: string[] = [];

  //   const command = `python parser_getFunctionContent.py ${filePath}`;
  //   const output = execSync(command);
  //   const data = JSON.parse(output.toString());
  //   let i = 0;
  //   let funct_attribute_name = '';
  //   for (const element of data) {
  //     funct_attribute_name = 'funct_' + i.toString();
  //     functionsContentList.push(element[funct_attribute_name]);
  //     i++;
  //   }
  //   return functionsContentList;
  // }

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
        const functionList = this.getPythonFunctionInfo(sourceFilePath);
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
            function: element.name,
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

  async getCodeReview(filePath: string): Promise<FileSuggestion[]> {
    return this.getCodeReviewOrTestCase(filePath, ReviewType.code_review);
  }

  async getTestCase(filePath: string): Promise<FileSuggestion[]> {
    return this.getCodeReviewOrTestCase(
      filePath,
      ReviewType.testcase_suggestion,
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

  async getCodeReviewOrTestCase(path: string, reviewType: ReviewType) {
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
        functionContentList = this.getPythonFunctionInfo(sourceFilePath).map(
          (ele) => ele.body,
        );
      } catch {
        // if cannot get content information, pass whole file content
        console.log('Get Python content: failed');
        functionContentList.push(fs.readFileSync(sourceFilePath, 'utf8'));
      }
      console.log(functionContentList);

      //console.log(codeReviewList);
      for (const element of functionContentList) {
        const suggestedCode =
          await this.ollamaService.callForUnitTestOrCodeReview(
            element,
            reviewType,
          );
        console.log(suggestedCode['choices'][0]['text']);
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
    const fileSuggestionList: FileSuggestion[] = await this.getCodeReview(path);

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
    const fileSuggestionList: FileSuggestion[] = await this.getTestCase(path);
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
