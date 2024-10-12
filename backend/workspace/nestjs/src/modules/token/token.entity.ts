import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  VersionColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity('Token')
export class Token {
  @PrimaryGeneratedColumn({ name: 'ID' })
  id: number;

  @Column({ name: 'AccessToken' })
  @Index({ unique: true })
  accessToken: string;

  @Column({ name: 'RefreshToken' })
  @Index({ unique: true })
  refreshToken: string;

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
  })
  updatedDatetime: Date;

  @Column({ name: 'DeletedDatetime', type: 'timestamp', nullable: true })
  deletedDatetime: Date | null;

  @Column({ name: 'Version' })
  @VersionColumn()
  version: number;

  @OneToOne(() => User, (user) => user.token)
  @JoinColumn({ name: 'UserID' })
  user: User;
}
