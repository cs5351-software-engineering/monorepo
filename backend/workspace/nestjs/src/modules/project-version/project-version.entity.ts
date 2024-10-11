import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  VersionColumn,
} from 'typeorm';

import { Project } from '../project/project.entity';
import { Scan } from '../scan/scan.entity';
@Entity('ProjectVersion')
export class ProjectVersion {
  @PrimaryGeneratedColumn({ name: 'ID' })
  id: number;

  @Column({ name: 'VersionNumber' })
  versionNumber: string;

  @Column({ name: 'ReleaseDate', type: 'timestamp' })
  releaseDate: Date;

  @Column({ name: 'Description' })
  description: string;

  @Column({ name: 'Status' })
  status: string;

  @Column({
    name: 'CreatedDatetime',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdDatetime: Date;

  @Column({
    name: 'UpdatedDatetime',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedDatetime: Date;

  @Column({ name: 'DeletedDatetime', type: 'timestamp', nullable: true })
  deletedDatetime: Date | null;

  @Column({ name: 'Version' })
  @VersionColumn()
  version: number;

  @OneToMany(() => Scan, (scan) => scan.projectVersion)
  scans: Scan[];

  @ManyToOne(() => Project, (project) => project.projectVersions)
  @JoinColumn({ name: 'ProjectID' })
  project: Project;
}
