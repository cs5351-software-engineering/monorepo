import * as path from 'path';

//get the Path structure that file keep at MinIO
export function GetFilePath(result_type: string, project_id: string, version: string): string {
  return path.join(result_type, project_id, version);
}

//window is using "\" while at MinIO, separator is "/"
export function UpdateFilePath(filePath: string): string {
    return filePath.replaceAll("\\","/")
  }