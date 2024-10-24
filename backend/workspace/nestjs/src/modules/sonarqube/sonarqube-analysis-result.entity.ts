import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('SonarQubeAnalysisResult')
export class SonarQubeAnalysisResult {
  @PrimaryGeneratedColumn({ name: 'ID' })
  id: number;

  @Column({ name: 'Status', type: 'text', nullable: true })
  status: string | null;

  @Column({ name: 'Stdout', type: 'text', nullable: true })
  stdout: string | null;

  @Column({ name: 'IssueListJsonString', type: 'text', nullable: true })
  issueListJsonString: string | null;

  @Column({ name: 'FilteredIssueListJsonString', type: 'text', nullable: true })
  filteredIssueListJsonString: string | null;

  @CreateDateColumn({ name: 'CreatedDatetime' })
  createdDatetime: Date;

  @UpdateDateColumn({ name: 'UpdatedDatetime' })
  updatedDatetime: Date;
}
