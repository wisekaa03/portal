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
import { FILES_RIGHT, FilesFolderResponse } from '@lib/types';
import { UserEntity } from '@back/user/user.entity';
// #endregion

@Entity('files_folder')
export class FilesFolderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  @ManyToOne((type: any) => UserEntity, { nullable: true, onDelete: 'SET NULL', onUpdate: 'CASCADE', eager: true })
  @JoinColumn()
  user: UserEntity;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  pathname: string;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  @ManyToOne((type: any) => UserEntity, { nullable: false, onDelete: 'SET NULL', onUpdate: 'CASCADE', eager: true })
  @JoinColumn()
  createdUser: UserEntity;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  @ManyToOne((type: any) => UserEntity, { nullable: false, onDelete: 'SET NULL', onUpdate: 'CASCADE', eager: true })
  @JoinColumn()
  updatedUser: UserEntity;

  toResponseObject = (): FilesFolderResponse => {
    return { right: FILES_RIGHT.ALL, ...this };
  };
}
