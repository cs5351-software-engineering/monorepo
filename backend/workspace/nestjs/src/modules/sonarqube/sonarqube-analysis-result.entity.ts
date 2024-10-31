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

  @Column({
    name: 'finalResultJsonString',
    type: 'text',
    nullable: true,
  })
  finalResultJsonString: string | null;

  @CreateDateColumn({ name: 'CreatedDatetime' })
  createdDatetime: Date;

  @UpdateDateColumn({ name: 'UpdatedDatetime' })
  updatedDatetime: Date;
}
