import { Injectable } from '@nestjs/common';
import { execSync } from 'child_process';

import * as ts from 'typescript';
import * as fs from 'fs'

import { FunctionInfo, OllamaService } from '../ollama/ollama.service';
    
@Injectable()
export class CodeSuggestionService {
    constructor(private readonly ollamaService: OllamaService) {}
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

    async getCodeSuggestion(filePath: string): Promise<any> {
        const functionList = CodeSuggestionService.prototype.getPythonFunctionDef(filePath);
        console.log(functionList);
        var codeSuggestionList: string[] = [];
        console.log(codeSuggestionList);
        for (let element of functionList) {
            const suggestedCode = await this.ollamaService.callGivePythonCodeSuggestion(element, this.ollamaService.model_codellama);
            console.log(suggestedCode['choices'][0]['text']);
            codeSuggestionList.push(suggestedCode['choices'][0]['text']);
        }
        return codeSuggestionList;
    }

    async getCodeReview(filePath: string): Promise<any> {
        return this.getCodeReviewOrTestCase(filePath, this.ollamaService.code_review)
    }

    async getTestCase(filePath: string): Promise<any> {
        return this.getCodeReviewOrTestCase(filePath, this.ollamaService.testcase_suggestion)
    }

    async getCodeReviewOrTestCase(filePath: string, revewType: string) {
        const functionContentList = CodeSuggestionService.prototype.getPythonFunctionContentList(filePath);
        console.log(functionContentList);
        var codeReviewList: string[] = [];
        console.log(codeReviewList);
        for (let element of functionContentList) {
            const suggestedCode = await this.ollamaService.callForUnitTestOrCodeReview(element, revewType);
            console.log(suggestedCode['choices'][0]['text']);
            codeReviewList.push(suggestedCode['choices'][0]['text']);
        }
        return codeReviewList;
    }

}
