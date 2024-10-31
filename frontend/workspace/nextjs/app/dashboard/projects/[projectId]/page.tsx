'use client'

import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, File } from "lucide-react"
import { Button } from '@/components/ui/button';
import { Progress } from "@/components/ui/progress"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

// Status enum
enum SonarQubeAnalysisStatus {
  notStarted = 'not-started',
  startScanner = 'start-scanner',
  scannerDoneAndStartPreprocess = 'scanner-done-and-start-preprocess',
  preprocessDoneAndStartOllama = 'preprocess-done-and-start-ollama',
  completed = 'completed',
  failed = 'failed',
}

export default function ProjectPageById({ params }: { params: { projectId: string } }) {
  console.log('projectId', params.projectId);

  const [project, setProject] = useState<{
    projectName: string;
    description: string;
    language: string;
    version: string;
    updatedDatetime: string;
  }>({
    projectName: '',
    description: '',
    language: '',
    version: '',
    updatedDatetime: '',
  });

  const [sonarQubeAnalysisProgress, setSonarQubeAnalysisProgress] = useState(0);
  const [sonarQubeAnalysisStatus, setSonarQubeAnalysisStatus] = useState(SonarQubeAnalysisStatus.notStarted);
  const [sonarQubeAnalysisResult, setSonarQubeAnalysisResult] = useState<{
    stdout: string;
    issueListJsonString: string;
    filteredIssueListJsonString: string;
    processedIssueObject: {
      [filePath: string]: {
        key: string,
        rule: string,
        severity: string,
        message: string,
        type: string,
        textRange: {
          startLine: number,
          endLine: number,
        },
        codeBlock: {
          lineNumber: number,
          line: string,
        }[],
      }[]
    };
  }>({
    stdout: "",
    issueListJsonString: "",
    filteredIssueListJsonString: "",
    processedIssueObject: {},
  });

  // Fetch project info
  useEffect(() => {
    axios.get(`http://localhost:8080/project/id/${params.projectId}`)
      .then(response => {
        setProject(response.data);
      })
      .catch(error => {
        console.error('Error fetching project:', error);
      });
  }, [params.projectId]);

  const handleStartSonarqubeAnalysis = async () => {
    const projectId = params.projectId;
    console.log('Start Sonarqube Analysis, projectId:', projectId);

    // Set sonarQubeAnalysisStatus to "Scanning"
    setSonarQubeAnalysisStatus(SonarQubeAnalysisStatus.startScanner);
    setSonarQubeAnalysisProgress(0);

    // Start Sonarqube Scanner
    await axios.post(`http://localhost:8080/sonarqube/startScanner`, { projectId })
      .then(response => {
        console.log('Sonarqube Analysis started:', response.data);
      })
      .catch(error => {
        console.error('Error starting Sonarqube Analysis:', error);
      });

    setSonarQubeAnalysisProgress(25);

    // Ping for status every 1 seconds until "Completed" or "Failed"
    // backend: @Get('getAnalysisResult/:projectId')
    const intervalId = setInterval(() => {
      axios.get(`http://localhost:8080/sonarqube/getAnalysisResult/${projectId}`)
        .then(response => {
          console.log('Sonarqube Analysis result:', response.data);

          // Set status and clear interval if failed
          setSonarQubeAnalysisStatus(response.data.status);
          if (response.data.status === SonarQubeAnalysisStatus.failed) {
            setSonarQubeAnalysisStatus(SonarQubeAnalysisStatus.failed);
            clearInterval(intervalId);
          }

          // Update progress bar
          if (response.data.status === SonarQubeAnalysisStatus.scannerDoneAndStartPreprocess) {
            setSonarQubeAnalysisProgress(50);
          }
          else if (response.data.status === SonarQubeAnalysisStatus.preprocessDoneAndStartOllama) {
            setSonarQubeAnalysisProgress(75);
          }
          else if (response.data.status === SonarQubeAnalysisStatus.completed) {
            setSonarQubeAnalysisProgress(100);
          }

          // Completed
          if (response.data.status === SonarQubeAnalysisStatus.completed) {
            const processedIssueObject = JSON.parse(response.data.processedIssueObjectJsonString)
            console.log('processedIssueObject', processedIssueObject);
            setSonarQubeAnalysisResult({
              stdout: response.data.stdout,
              issueListJsonString: response.data.issueListJsonString,
              filteredIssueListJsonString: response.data.filteredIssueListJsonString,
              processedIssueObject: processedIssueObject,
            });
            clearInterval(intervalId);
          }
        })
        .catch(error => {
          console.error('Error getting Sonarqube Analysis result:', error);
          setSonarQubeAnalysisStatus(SonarQubeAnalysisStatus.failed);
          clearInterval(intervalId);
        });
    }, 1000);
  }

  return (
    <div>

      {/* Project Name */}
      <h1 className="text-3xl font-bold mb-8">Project Name: {project.projectName}</h1>

      {/* Project Info */}
      <div className="flex flex-row gap-4 mb-4 font-mono">
        <Card>
          <CardContent className="p-4">
            Project ID: {params.projectId}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            Version: {project.version}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            Language: {project.language}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            Updated Datetime: {new Date(project.updatedDatetime).toLocaleDateString()}
          </CardContent>
        </Card>
      </div>

      {/* Project Description */}
      <div className="text-md mb-8">
        Project Description: {project.description}
      </div>

      {/* Analysis title */}
      <div className="text-2xl font-bold mb-4 flex flex-row gap-2 items-center">
        <LineChart className="w-6 h-6" />
        <div>Analysis</div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="sonarqube" className="mb-4">
        <TabsList className="mb-2">
          <TabsTrigger value="sonarqube">Sonarqube</TabsTrigger>
          <TabsTrigger value="ollama">Ollama</TabsTrigger>
          <TabsTrigger value="vulnerability">Vulnerability Scanning</TabsTrigger>
          <TabsTrigger value="other">Other</TabsTrigger>
        </TabsList>

        {/* Report History */}
        {/* <Button size="sm" className='text-sm ml-4'>Report History</Button> */}

        {/* Sonarqube */}
        <TabsContent value="sonarqube">
          {sonarQubeAnalysisStatus === SonarQubeAnalysisStatus.notStarted ? (
            <Button size="lg" onClick={handleStartSonarqubeAnalysis}>Start Sonarqube Analysis</Button>
          ) : sonarQubeAnalysisStatus === SonarQubeAnalysisStatus.startScanner ? (
            <>
              <Progress value={sonarQubeAnalysisProgress} className="w-[100%]" />
              <div className="text-sm mt-2">Scanning by SonarQube Scanner ...</div>
            </>
          ) : sonarQubeAnalysisStatus === SonarQubeAnalysisStatus.scannerDoneAndStartPreprocess ? (
            <>
              <Progress value={sonarQubeAnalysisProgress} className="w-[100%]" />
              <div className="text-sm mt-2">Scanning by SonarQube Scanner ... Done</div>
              <div className="text-sm mt-2">Getting result from SonarQube server and preprocess ...</div>
            </>
          ) : sonarQubeAnalysisStatus === SonarQubeAnalysisStatus.preprocessDoneAndStartOllama ? (
            <>
              <Progress value={sonarQubeAnalysisProgress} className="w-[100%]" />
              <div className="text-sm mt-2">Scanning by SonarQube Scanner ... Done</div>
              <div className="text-sm mt-2">Getting result from SonarQube server and preprocess ... Done</div>
              <div className="text-sm mt-2">Analysis by Ollama ...</div>
            </>
          ) : sonarQubeAnalysisStatus === SonarQubeAnalysisStatus.completed ? (
            <>
              <div className="text-lg font-bold mb-2">Sonarqube Analysis Result</div>
              <div>

                {/* processedIssueObject */}
                <div className='text-lg font-bold mb-2'>processedIssueObject</div>
                <div className='flex flex-col gap-4 mb-4'>
                  {Object.entries(sonarQubeAnalysisResult.processedIssueObject).map(([filePath, issueList]) => (

                    // Card for each file
                    <Card key={filePath}>
                      <CardHeader>
                        <CardTitle className='text-lg font-bold font-mono flex flex-row gap-2 items-center'>
                          <File className="w-6 h-6" /> {filePath}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-2">
                        {issueList.map((issue) => (
                          <Card key={issue.key} className="">

                            {/* Header, display issue severity, type, rule, and key */}
                            <CardHeader>
                              <div className="flex flex-row gap-2">
                                <div className={`text-sm font-bold rounded-md px-2 py-1 ${issue.severity === 'INFO' ? 'text-blue-600 bg-blue-100' :
                                  issue.severity === 'MINOR' ? 'text-green-500 bg-green-100' :
                                    issue.severity === 'MAJOR' ? 'text-yellow-500 bg-yellow-100' :
                                      issue.severity === 'CRITICAL' ? 'text-red-500 bg-red-100' : ''
                                  }`}>{issue.severity}</div>
                                <div className="text-sm rounded-md px-2 py-1 bg-gray-100 text-black">{issue.type}</div>
                                <div className="text-sm rounded-md px-2 py-1 bg-gray-100 text-black">{issue.rule}</div>
                                <div className="text-sm rounded-md px-2 py-1 bg-gray-100 text-black">{issue.key}</div>
                              </div>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-2">

                              {/* Message */}
                              <div className="whitespace-pre-wrap break-all">
                                <div className="text-md mb-2">Message:</div>
                                <div className="bg-gray-100 p-2 rounded-md text-black">{issue.message}</div>
                              </div>

                              {/* Code snippet */}
                              <div className="whitespace-pre-wrap break-all">
                                <div className="text-md mb-2">Code snippet (line {issue.textRange.startLine} to {issue.textRange.endLine}):</div>
                                <div className="bg-gray-100 p-2 rounded-md text-black font-mono">
                                  {issue.codeBlock.map((ele, index) => (
                                    <div key={index} className={`${ele.lineNumber >= issue.textRange.startLine &&
                                      ele.lineNumber <= issue.textRange.endLine ?
                                      'bg-red-100' : ''
                                      }`}>{ele.line}</div>
                                  ))}
                                </div>
                              </div>

                              {/* Response from Ollama */}
                              <div className="whitespace-pre-wrap break-all">
                                <div className="text-md mb-2">Response from Ollama:</div>
                                <div className="bg-gray-100 p-2 rounded-md text-black">
                                  Response block here
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* stdout */}
                <Accordion type="single" collapsible>
                  <AccordionItem value="item-1">
                    <AccordionTrigger className='text-lg font-bold'>stdout</AccordionTrigger>
                    <AccordionContent>
                      <div className='text-sm whitespace-pre-wrap break-all bg-gray-100 p-2 rounded-md text-black font-mono'>
                        {sonarQubeAnalysisResult.stdout}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </>
          ) : sonarQubeAnalysisStatus === SonarQubeAnalysisStatus.failed ? (
            <div>Failed</div>
          ) : (
            <div>Unknown</div>
          )}
        </TabsContent>

        {/* Ollama */}
        <TabsContent value="ollama">
          <Button size="lg">Start Ollama Analysis</Button>
        </TabsContent>

        {/* Vulnerability Scanning */}
        <TabsContent value="vulnerability">
          <Button size="lg">Start Vulnerability Scanning</Button>
        </TabsContent>

        {/* Other */}
        <TabsContent value="other">Other</TabsContent>
      </Tabs>

    </div>
  );
}

