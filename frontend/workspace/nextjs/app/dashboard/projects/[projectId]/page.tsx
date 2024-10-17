'use client'

import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import {
  LineChart,
} from "lucide-react"

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

  useEffect(() => {
    axios.get(`http://localhost:8080/project/id/${params.projectId}`)
      .then(response => {
        setProject(response.data);
      })
      .catch(error => {
        console.error('Error fetching project:', error);
      });
  }, [params.projectId]);

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

      {/* Tabs, make bigger */}
      <Tabs defaultValue="sonarqube" className="mb-4">
        <TabsList className="mb-2">
          <TabsTrigger value="sonarqube">Sonarqube</TabsTrigger>
          <TabsTrigger value="ollama">Ollama</TabsTrigger>
          <TabsTrigger value="vulnerability">Vulnerability Scanning</TabsTrigger>
          <TabsTrigger value="other">Other</TabsTrigger>
        </TabsList>
        <TabsContent value="sonarqube">Sonarqube</TabsContent>
        <TabsContent value="ollama">Ollama</TabsContent>
        <TabsContent value="vulnerability">Vulnerability Scanning</TabsContent>
        <TabsContent value="other">Other</TabsContent>
      </Tabs>

    </div>
  );
}

