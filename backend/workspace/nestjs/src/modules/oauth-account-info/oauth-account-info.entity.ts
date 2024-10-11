import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  VersionColumn,
  Index,
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity('OAuthAccountInfo')
export class OAuthAccountInfo {
  @PrimaryGeneratedColumn({ name: 'ID' })
  id: number;

  @Column({ name: 'MemberId' })
  @Index({ unique: true })
  memberId: string;

  @Column({ name: 'OauthProvider' })
  @Index({ unique: false })
  oauthProvider: string;

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

  @ManyToOne(() => User, (user) => user.oauthAccountInfo)
  @JoinColumn({ name: 'UserID' })
  user: User;
}
