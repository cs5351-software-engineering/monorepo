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
import { LibrarySuggestion } from '../library-suggestion/library-suggestion.entity';

@Entity('Migration')
export class Migration {
  @PrimaryGeneratedColumn({ name: 'ID' })
  id: number;

  @Column({ name: 'StartDatetime', type: 'timestamp' })
  startDatetime: Date;

  @Column({ name: 'EndDatetime', type: 'timestamp', nullable: true })
  endDatetime: Date | null;

  @Column({ name: 'MigrationStatus' })
  migrationStatus: string;

  @Column({ name: 'Details' })
  details: string;

  @Column({ name: 'SourceCodeURL' })
  sourceCodeURL: string;

  @Column({ name: 'TargetCodeURL' })
  targetCodeURL: string;

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
    () => LibrarySuggestion,
    (librarySuggestion) => librarySuggestion.migration,
  )
  librarySuggestions: LibrarySuggestion[];

  @ManyToOne(() => Project, (project) => project.migrations)
  @JoinColumn({ name: 'ProjectID' })
  project: Project;
}
