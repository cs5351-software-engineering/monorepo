'use client'

import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart } from "lucide-react"
import { Button } from '@/components/ui/button';
import { Progress } from "@/components/ui/progress"

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
  const [sonarQubeAnalysisStatus, setSonarQubeAnalysisStatus] = useState("Not Started");
  const [sonarQubeAnalysisResult, setSonarQubeAnalysisResult] = useState({
    stdout: "",
    issueListJsonString: "",
    filteredIssueListJsonString: "",
  });

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
    setSonarQubeAnalysisStatus("Running");
    setSonarQubeAnalysisProgress(0);

    // Start Sonarqube Scanner
    await axios.post(`http://localhost:8080/sonarqube/startScanner`, { projectId })
      .then(response => {
        console.log('Sonarqube Analysis started:', response.data);
      })
      .catch(error => {
        console.error('Error starting Sonarqube Analysis:', error);
      });

    setSonarQubeAnalysisProgress(30);

    // Ping for status every 1 seconds until "Completed" or "Failed"
    // backend: @Get('getAnalysisResult/:projectId')
    const intervalId = setInterval(() => {
      axios.get(`http://localhost:8080/sonarqube/getAnalysisResult/${projectId}`)
        .then(response => {
          console.log('Sonarqube Analysis result:', response.data);
          setSonarQubeAnalysisStatus(response.data.status);
          if (response.data.status === 'Scanner Done') {
            setSonarQubeAnalysisProgress(60);
          }
          else if (response.data.status === 'Completed') {
            setSonarQubeAnalysisProgress(100);
            setSonarQubeAnalysisResult({
              stdout: response.data.stdout,
              issueListJsonString: response.data.issueListJsonString,
              filteredIssueListJsonString: response.data.filteredIssueListJsonString,
            });
            clearInterval(intervalId);
          }
          else if (response.data.status === 'Failed') {
            setSonarQubeAnalysisStatus("Failed");
            clearInterval(intervalId);
          }
        })
        .catch(error => {
          console.error('Error getting Sonarqube Analysis result:', error);
          setSonarQubeAnalysisStatus("Failed");
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
        <Button size="sm" className='text-sm ml-4'>Report History</Button>

        {/* Sonarqube */}
        <TabsContent value="sonarqube">
          {sonarQubeAnalysisStatus === "Not Started" ? (
            <Button size="lg" onClick={handleStartSonarqubeAnalysis}>Start Sonarqube Analysis</Button>
          ) : sonarQubeAnalysisStatus === "Running" ? (
            <>
              <Progress value={sonarQubeAnalysisProgress} className="w-[100%]" />
              <div className="text-sm mt-2">Scanning by SonarQube Scanner ...</div>
            </>
          ) : sonarQubeAnalysisStatus === "Scanner Done" ? (
            <>
              <Progress value={sonarQubeAnalysisProgress} className="w-[100%]" />
              <div className="text-sm mt-2">Scanner Done, waiting for SonarQube server analysis result ...</div>
            </>
          ) : sonarQubeAnalysisStatus === "Completed" ? (
            <>
              <div className="text-lg font-bold mb-2">Sonarqube Analysis Result</div>
              <div>

                {/* filteredIssueListJsonString */}
                <div className='text-lg font-bold mb-2'>filteredIssueListJsonString</div>
                <div className='text-sm whitespace-pre-wrap break-all'>
                  {JSON.stringify(JSON.parse(sonarQubeAnalysisResult.filteredIssueListJsonString), null, 2)}
                </div>

                {/* issueListJsonString */}
                <div className='text-lg font-bold mb-2'>issueListJsonString</div>
                <div className='text-sm whitespace-pre-wrap break-all'>
                  {JSON.stringify(JSON.parse(sonarQubeAnalysisResult.issueListJsonString), null, 2)}
                </div>

                {/* stdout */} 
                <div className='text-lg font-bold mb-2'>stdout</div>
                <div className='text-sm whitespace-pre-wrap break-all'>
                  {sonarQubeAnalysisResult.stdout}
                </div>
              </div>
            </>
          ) : sonarQubeAnalysisStatus === "Failed" ? (
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

