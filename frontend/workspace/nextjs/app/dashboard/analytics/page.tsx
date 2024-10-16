'use client'

import React, { Key, useContext } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Context
import { UserIdContext, ProjectListContext } from '../layout';

const AnalyticsPage: React.FC = () => {
  const userId = useContext(UserIdContext);
  const projects = useContext(ProjectListContext);

  const handleDeleteProject = (projectId: Key | null | undefined) => {
    console.log('delete project', projectId);
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Analytics</h1>

      {/* Tabs */}
      <Tabs defaultValue="sonarqube" className="w-[400px] mb-4">
        <TabsList>
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

      {/* Existing projects list */}
      <div className="flex flex-wrap gap-4">
        {projects.length === 0 && (
          <div className="text-gray-400">No projects found</div>
        )}
        {projects.map((project) => (
          <Card key={project.id} className="w-[420px]">

            {/* Card header, title and language */}
            <CardHeader>
              <CardTitle className="mb-2">
                <div className="flex items-center gap-2">
                  <Package className="h-6 w-6" />
                  <div className="text-lg">{project.projectName}</div>
                </div>
              </CardTitle>
              <CardDescription className="mb-2 text-sm text-gray-400">
                <p>Language: {project.language}</p>
                <p>Version: {project.version}</p>
                <p>Last updated: {project.updatedDatetime}</p>
              </CardDescription>
            </CardHeader>

            {/* Card content, description */}
            <CardContent className="h-[80px]">
              <p className="line-clamp-3 text-sm text-gray-400 mb-2">{project.description.slice(0, 100)}...</p>
            </CardContent>

            {/* Card footer, buttons */}
            <CardFooter className="flex justify-end gap-2">
              {/* <Button size="sm" className='text-sm' variant="outline">View</Button> */}
              {/* <Button size="sm" className='text-sm' variant="outline" onClick={() => handleUploadProject(project.id)}>Upload</Button>
              <Button size="sm" className='text-sm' variant="outline" onClick={() => handleDownloadProject(project.id)}>Download</Button> */}

              {/* Delete button */}
              <AlertDialog>
                <AlertDialogTrigger>
                  <Button size="sm" className='text-sm bg-red-500 text-white hover:bg-red-600' variant="outline">Delete</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure delete this project?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your project
                      and remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction className='bg-red-500 text-white hover:bg-red-600' onClick={() => handleDeleteProject(project.id)}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        ))}
      </div>

    </div>
  );
};

export default AnalyticsPage;

