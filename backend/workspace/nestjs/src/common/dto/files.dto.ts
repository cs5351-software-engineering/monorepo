import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

interface UserFile {
  user_name: string;

  result_type: string;

  project_id: string;

  version: string;
}

export class FileDtoSingle implements UserFile {
  @ApiProperty({ description: 'Username: use as bucket name', required: true })
  @IsString()
  user_name: string;

  @ApiProperty({
    description: 'Result type: it can be "scan_result", "source_code"',
    required: true,
  })
  @IsString()
  result_type: string;

  @ApiProperty({ description: 'Project ID', required: true })
  @IsString()
  project_id: string;

  @ApiProperty({ description: 'Version number', required: true })
  @IsString()
  version: string;

  //replace the original file name
  @ApiProperty({
    description: 'Replace the original file name',
    required: true,
  })
  @IsString()
  fileName: string;
}

export class FileDtoMultiple implements UserFile {
  @ApiProperty({ description: 'Username: use as bucket name', required: true })
  @IsString()
  user_name: string;

  @ApiProperty({
    description: 'Result type: it can be "scan_result", "source_code"',
    required: true,
  })
  @IsString()
  result_type: string;

  @ApiProperty({ description: 'Project ID', required: true })
  @IsString()
  project_id: string;

  @ApiProperty({ description: 'Version number', required: true })
  @IsString()
  version: string;

  //if user upload mutiple file, determine whethe need to zip into one or not
  @ApiProperty({
    description:
      '"0" or "1": when user upload multiple files, determine files store at MinIO directly, or "zip them into 1 files":',
    required: true,
  })
  zip?: string;

  //use as the zip file name
  @ApiProperty({
    description: 'use to determine the zipped file name',
    required: true,
  })
  zippedFileName?: string;
}
