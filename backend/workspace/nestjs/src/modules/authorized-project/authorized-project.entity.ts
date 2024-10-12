import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  VersionColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Project } from '../project/project.entity';

@Entity('AuthorizedProject')
export class AuthorizedProject {
  @PrimaryGeneratedColumn({ name: 'ID' })
  id: number;

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

  @ManyToOne(() => User, (user) => user.authorizedProjects)
  @JoinColumn({ name: 'UserID' })
  user: User;

  @ManyToOne(() => Project, (project) => project.authorizedProjects)
  @JoinColumn({ name: 'ProjectID' })
  project: Project;
}
