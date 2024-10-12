import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  VersionColumn,
} from 'typeorm';
import { AuthorizedProject } from '../authorized-project/authorized-project.entity';
import { ProjectVersion } from '../project-version/project-version.entity';
import { Migration } from '../migration/migration.entity';

@Entity('Project')
export class Project {
  @PrimaryGeneratedColumn({ name: 'ID' })
  id: number;

  @Column({ name: 'ProjectName' })
  projectName: string;

  @Column({ name: 'RepositoryURL' })
  repositoryURL: string;

  @Column({ name: 'Language' })
  language: string;

  @Column({ name: 'CurrentVersion' })
  currentVersion: string;

  @Column({ name: 'TargetVersion' })
  targetVersion: string;

  @Column({ name: 'LastScanDatetime', type: 'timestamp', nullable: true })
  lastScanDatetime: Date | null;

  @Column({ name: 'LastMigrationDatetime', type: 'timestamp', nullable: true })
  lastMigrationDatetime: Date | null;

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

  @OneToMany(
    () => AuthorizedProject,
    (authorizedProject) => authorizedProject.project,
  )
  authorizedProjects: AuthorizedProject[];

  @OneToMany(() => ProjectVersion, (projectVersion) => projectVersion.project)
  projectVersions: ProjectVersion[];

  @OneToMany(() => Migration, (migration) => migration.project)
  migrations: Migration[];
}
