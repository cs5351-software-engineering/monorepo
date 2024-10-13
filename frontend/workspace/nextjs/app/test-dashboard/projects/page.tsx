"use client"

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const fakeProjects = [
  { name: "Project Name 1", language: "Python", description: "Description 1 xxxxxx xxxxxxxxxx xxxxxxxxxx xxxxxxxxxx xxxxxxxxxx xxxxxxxxxx xxxxxxxxxx xxxxxxxxxx xxxxxxxxxx xxxxxxxxxx xxxxxxxxxx xxxxxxxxxx" },
  { name: "Project Name 2", language: "Any", description: "Description 2" },
  { name: "Project Name 3", language: "Python", description: "Description 3" },
  { name: "Project Name 4", language: "Any", description: "Description 4" },
]

const ProjectsPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Projects</h1>

      {/* Top bar */}
      <div className="ml-auto flex items-center gap-2 mb-8">

        {/* Language selector */}
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a language" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="python">Python</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* File upload button and dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Upload project (.zip)</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Upload project (.zip)</DialogTitle>
              <DialogDescription>
                Upload your project here. Click save when you&lsquo;re done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Project name
                </Label>
                <Input
                  id="name"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>

      <h2 className="text-xl font-bold mb-8">Existing projects</h2>

      {/* Existing projects list */}
      <div className="flex flex-wrap gap-4">
        {fakeProjects.map((project) => (
          <Card key={project.name} className="w-[300px]">
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
              <CardDescription>{project.language}</CardDescription>
            </CardHeader>
            <CardContent className="h-[80px]">
              <p className="line-clamp-3 text-sm text-gray-400">{project.description.slice(0, 100)}...</p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button size="sm" variant="outline">View</Button>
              <Button size="sm" variant="outline">Download</Button>
              <Button size="sm" variant="outline" className="bg-red-500 text-white hover:bg-red-600">Delete</Button>
            </CardFooter>
          </Card>
        ))}
      </div>

    </div>
  );
};

export default ProjectsPage;

