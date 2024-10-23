import { Injectable } from '@nestjs/common';
import { execSync } from 'child_process';

import * as ts from 'typescript';
import * as fs from 'fs'

import { FunctionInfo, OllamaService } from '../ollama/ollama.service';

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

    getPythonFunctionContentList(filePath: string, ): any {
        const command = `python3 parser_getFunctionContent.py ${filePath}`;
        const output = execSync(command);
        
        const data = JSON.parse(output.toString());
        var i = 0;
        var funct_attribute_name = ""
        var functionsContentList: string[] =[];
        for (let element of data) {
            funct_attribute_name = "funct_" + i.toString();
            functionsContentList.push(element[funct_attribute_name]);
            i++;
        }
        return functionsContentList
    }

    async getCodeSuggestion(ollamaService: OllamaService, filePath: string): Promise<CodeSuggestion[]> {
        var codeReviewList: CodeSuggestion[] = [];
        try {
            const functionList = CodeSuggestionService.prototype.getPythonFunctionDef(filePath);
            console.log(functionList);
            var codeSuggestionList: string[] = [];
            console.log(codeSuggestionList);
            for (let element of functionList) {
                const suggestedCode = await ollamaService.callGivePythonCodeSuggestion(element, ollamaService.model_codellama);
                console.log(suggestedCode['choices'][0]['text']);
                codeSuggestionList.push(suggestedCode['choices'][0]['text']);
            }
        } catch {
            //do nothing: cannot provide infill function as we cannot define function name, parameter, and return type
        }
             
        
        return codeReviewList;
    }

    async getCodeReview(ollamaService: OllamaService, filePath: string): Promise<CodeSuggestion[]> {
        return this.getCodeReviewOrTestCase(ollamaService, filePath, ollamaService.code_review)
    }

    async getTestCase(ollamaService: OllamaService,filePath: string): Promise<CodeSuggestion[]> {
        return this.getCodeReviewOrTestCase(ollamaService, filePath, ollamaService.testcase_suggestion)
    }

    async getCodeReviewOrTestCase(ollamaService: OllamaService, filePath: string, revewType: string) {
        let functionContentList: string[] = [];
        try {
            functionContentList = CodeSuggestionService.prototype.getPythonFunctionContentList(filePath);
        } catch {
            //cannot get content information
            functionContentList.push(fs.readFileSync(filePath, 'utf8'))
        }
        
        console.log(functionContentList);
        var codeReviewList: CodeSuggestion[] = [];
        console.log(codeReviewList);
        for (let element of functionContentList) {
            const suggestedCode = await ollamaService.callForUnitTestOrCodeReview(element, revewType);
            const suggestion: CodeSuggestion = {
                function: element,
                suggestion: suggestedCode['choices'][0]['text']
            };
            codeReviewList.push(suggestion);
        }
        return codeReviewList;
    }

    getCodeSuggestionContent(CodeSuggestionList: CodeSuggestion[]) {
        var content = "";
        var i: number = 1;
        CodeSuggestionList.forEach(element => {
            content = content + '\r\n'
            content = content + '*** Sugest Section ' + i.toString() + ': start ***\r\n'
            content = content + '*** Code ***\r\n'
            content = content + element.function + '\r\n'
            content = content + '*** Suggestion ***\r\n'
            content = content + element.suggestion + '\r\n'
            content = content + '*** Sugested Section ' + i.toString() + ': end ***\r\n'
            content = content + '**************************************************\r\n\r\n\r\n'
            i++;
        });
        if (content =="")
            content = "No Suggestion!"
        return content;
    }

}
