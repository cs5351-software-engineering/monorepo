import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  VersionColumn,
} from 'typeorm';
import { Migration } from '../migration/migration.entity';

@Entity('LibrarySuggestion')
export class LibrarySuggestion {
  @PrimaryGeneratedColumn({ name: 'ID' })
  id: number;

  @Column({ name: 'CurrentLibrary' })
  currentLibrary: string;

  @Column({ name: 'SuggestedLibrary' })
  suggestedLibrary: string;

  @Column({ name: 'Reason' })
  reason: string;

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

  @ManyToOne(() => Migration, (migration) => migration.librarySuggestions)
  @JoinColumn({ name: 'MigrationID' })
  migration: Migration;
}
