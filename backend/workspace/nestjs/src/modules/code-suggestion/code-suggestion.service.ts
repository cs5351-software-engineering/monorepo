import { Injectable } from '@nestjs/common';
import { execSync } from 'child_process';

import * as ts from 'typescript';
import * as fs from 'fs'
//as path is used as function parameter, i.e.: change to "pathLib"
import * as pathLib from 'path'
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
    extractFunctionInfo(filePath: string): FunctionInfo[] {
        console.log(filePath);
        const fileContents = fs.readFileSync(filePath, 'utf8');
        console.log(fileContents);
        const sourceFile = ts.createSourceFile('tempFile.ts', fileContents, ts.ScriptTarget.Latest, true);
    
        const functions: FunctionInfo[] = [];
        function visit(node: ts.Node) {
            //isFunctionDeclaration: only support TypeScript and JavaScript code
          if (ts.isFunctionDeclaration(node) && node.name) {
            const funcName = node.name.getText();
            const parameters = node.parameters.map(param => param.name.getText());
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

        data.forEach(element => {
            const funcName = element['name'];
            const parameters = element['parameters'];
            const returnType = element['returnType'];
            functions.push({ name: funcName, parameters, returnType });
        });

        return functions
    }

    getPythonFunctionContentList(filePath: string): any {
        var functionsContentList: string[] =[];

        const command = `python3 parser_getFunctionContent.py ${filePath}`;
        const output = execSync(command);
        const data = JSON.parse(output.toString());
        var i = 0;
        var funct_attribute_name = ""
        for (let element of data) {
            funct_attribute_name = "funct_" + i.toString();
            functionsContentList.push(element[funct_attribute_name]);
            i++;
        }
        return functionsContentList
    }

    async getCodeSuggestion(ollamaService: OllamaService, path: string): Promise<FileSuggestion[]> {
        let filePathList: string[] = [];
        var fileSuggestionList: FileSuggestion[] = [];

        const stat = fs.statSync(path);
        if (stat.isDirectory()) 
            filePathList = this.getFilePath(path);
        else
        filePathList.push(path);
    
        for (let sourceFilePath of filePathList)
        {
            var codeReviewList: CodeSuggestion[] = [];
            try {
                const functionList = CodeSuggestionService.prototype.getPythonFunctionDef(sourceFilePath);
                console.log(functionList);
                var codeSuggestionList: string[] = [];
                console.log(codeSuggestionList);
                for (let element of functionList) {
                    const suggestedCode = await ollamaService.callGivePythonCodeSuggestion(element, ollamaService.model_codellama);
                    const suggestion: CodeSuggestion = {
                        function: element,
                        suggestion: suggestedCode['choices'][0]['text']
                    };
                    codeReviewList.push(suggestion);
                }
                const updateTargetPath: string = this.getTargetPath(sourceFilePath, '_infill')
                console.log('path:', path)
                console.log('source path:', sourceFilePath)
                console.log('updateTargetPath:', updateTargetPath)
                const fileSuggestion: FileSuggestion = {
                    sourceFilePath: sourceFilePath,
                    targetFilePath: updateTargetPath,
                    codeSuggestion: codeReviewList
                }
                fileSuggestionList.push(fileSuggestion)
            } catch {
                //do nothing: cannot provide infill function as we cannot define function name, parameter, and return type
            }
        }
        
        return fileSuggestionList;
    }

    async getCodeReview(ollamaService: OllamaService, filePath: string): Promise<FileSuggestion[]> {
        return this.getCodeReviewOrTestCase(ollamaService, filePath, ollamaService.code_review)
    }

    async getTestCase(ollamaService: OllamaService,filePath: string): Promise<FileSuggestion[]> {
        return this.getCodeReviewOrTestCase(ollamaService, filePath, ollamaService.testcase_suggestion)
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

    async getCodeReviewOrTestCase(ollamaService: OllamaService, path: string, reviewType: string) {
        let filePathList: string[] = [];
        var fileSuggestionList: FileSuggestion[] = [];

        const stat = fs.statSync(path);
        if (stat.isDirectory()) 
            filePathList = this.getFilePath(path);
        else
            filePathList.push(path);
    
        for (let sourceFilePath of filePathList)
        {
            var codeReviewList: CodeSuggestion[] = [];
            let functionContentList: string[] = [];
            try {
                console.log('Get Python content:', sourceFilePath)
                functionContentList = CodeSuggestionService.prototype.getPythonFunctionContentList(sourceFilePath);
            } catch {
                //cannot get content information
                console.log('Get Python content: failed')
                functionContentList.push(fs.readFileSync(sourceFilePath, 'utf8'))
            }
            console.log(functionContentList);
            
            //console.log(codeReviewList);
            for (let element of functionContentList) {
                const suggestedCode = await ollamaService.callForUnitTestOrCodeReview(element, reviewType);
                const suggestion: CodeSuggestion = {
                    function: element,
                    suggestion: suggestedCode['choices'][0]['text']
                };
                codeReviewList.push(suggestion);
            }
            
            const updateTargetPath: string = this.getTargetPath(sourceFilePath, reviewType)
            console.log('path:', path)
            console.log('source path:', sourceFilePath)
            console.log('updateTargetPath:', updateTargetPath)
            const fileSuggestion: FileSuggestion = {
                sourceFilePath: sourceFilePath,
                targetFilePath: updateTargetPath,
                codeSuggestion: codeReviewList
            }
            fileSuggestionList.push(fileSuggestion)
        }
        return fileSuggestionList;
    }

    getTargetPath(sourceFilePath: string, suffix: string): string {
        const directoryPath: string = pathLib.dirname(sourceFilePath)
        const fileName: string = pathLib.basename(sourceFilePath)
        return pathLib.join(directoryPath,suffix,fileName);
    }

    getCodeSuggestionContent(CodeSuggestionList: CodeSuggestion[]) {
        var content = "";
        var i: number = 1;
        CodeSuggestionList.forEach(element => {
            content = content + '\r\n'
            content = content + '*** Function Suggestion (' + i.toString() + '): start ***\r\n'
            content = content + '*** Original Function ***\r\n'
            content = content + element.function.toString() + '\r\n'
            content = content + '***----------------------------------------------***\r\n'
            content = content + '*** Suggestion ***\r\n'
            content = content + element.suggestion.toString() + '\r\n'
            content = content + '*** Function Suggestion (' + i.toString() + '): end ***\r\n'
            content = content + '**************************************************\r\n\r\n\r\n'
            i++;
        });
        if (content =="")
            content = "No Suggestion!"
        return content;
    }

    
    async startCodeReview(ollamaService: OllamaService, path: string) {
        const fileSuggestionList: FileSuggestion[] = await this.getCodeReview(ollamaService,path,);

        for (let fileSuggestion of fileSuggestionList) {
            const fileContent: string = this.getCodeSuggestionContent(fileSuggestion.codeSuggestion);
            const directoryPath: string = pathLib.dirname(fileSuggestion.targetFilePath);
            if (!fs.existsSync(directoryPath)) {
                fs.mkdirSync(directoryPath);
                console.log('Directory created!');
            }
            await writeFileAsync(fileSuggestion.targetFilePath, fileContent) 
        }
        return fileSuggestionList;
      }

      async startGetTestCase(ollamaService: OllamaService, path: string){
        const fileSuggestionList: FileSuggestion[] = await this.getTestCase(ollamaService, path)
        for (let fileSuggestion of fileSuggestionList) {
            const fileContent: string = this.getCodeSuggestionContent(fileSuggestion.codeSuggestion);
            const directoryPath: string = pathLib.dirname(fileSuggestion.targetFilePath);
            if (!fs.existsSync(directoryPath)) {
                fs.mkdirSync(directoryPath);
                console.log('Directory created!');
            }
            await writeFileAsync(fileSuggestion.targetFilePath, fileContent) 
        }
        return fileSuggestionList;
      }

      async startCodeInfill(ollamaService: OllamaService, path: string){
        const fileSuggestionList: FileSuggestion[] = await this.getCodeSuggestion(ollamaService, path)
        for (let fileSuggestion of fileSuggestionList) {
            const fileContent: string = this.getCodeSuggestionContent(fileSuggestion.codeSuggestion);
            const directoryPath: string = pathLib.dirname(fileSuggestion.targetFilePath);
            if (!fs.existsSync(directoryPath)) {
                fs.mkdirSync(directoryPath);
                console.log('Directory created!');
            }
            await writeFileAsync(fileSuggestion.targetFilePath, fileContent) 
        }
        return fileSuggestionList;
      }
}
