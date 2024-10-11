import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  VersionColumn,
} from 'typeorm';

import { ProjectVersion } from '../project-version/project-version.entity';
import { ScanSuggestion } from '../scan-suggestion/scan-suggestion.entity';

@Entity('Scan')
export class Scan {
  @PrimaryGeneratedColumn({ name: 'ID' })
  id: number;

  @Column({ name: 'ScanDatetime', type: 'timestamp' })
  scanDatetime: Date;

  @Column({ name: 'ScanStatus' })
  scanStatus: string;

  @Column({ name: 'ScanResultsURL' })
  scanResultsURL: string;

  @Column({ name: 'Summary' })
  summary: string;

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

  @OneToMany(() => ScanSuggestion, (scanSuggestion) => scanSuggestion.scan)
  scanSuggestions: ScanSuggestion[];

  @ManyToOne(() => ProjectVersion, (projectVersion) => projectVersion.scans)
  @JoinColumn({ name: 'ProjectVersionID' })
  projectVersion: ProjectVersion;
}
