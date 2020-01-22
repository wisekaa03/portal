/** @format */

// #region Imports NPM
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
// #endregion
// #region Imports Local
import { UserEntity } from '../user/user.entity';
// #endregion

@Entity('media.directory')
export class MediaDirectoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  pathname: string;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  @ManyToOne((type: any) => UserEntity)
  @JoinColumn()
  createdUser: UserEntity;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  @ManyToOne((type: any) => UserEntity)
  @JoinColumn()
  updatedUser: UserEntity;
}
