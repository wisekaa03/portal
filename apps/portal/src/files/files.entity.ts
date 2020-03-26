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
import { UserEntity } from '@back/user/user.entity';
import { FilesFolderEntity } from './files.folder.entity';
// #endregion

@Entity('files')
export class FilesEntity {
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
  title: string;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  @ManyToOne((type: any) => FilesFolderEntity, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    eager: true,
  })
  @JoinColumn()
  folder: FilesFolderEntity;

  // TODO: это ссылка на файл, который будет лежать где-то... продумать.
  @Column({
    type: 'varchar',
    nullable: false,
    default: '',
  })
  filename: string;

  @Column({
    type: 'varchar',
    nullable: false,
    default: '',
  })
  mimetype: string;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  @ManyToOne((type: any) => UserEntity, { nullable: false, onDelete: 'SET NULL', onUpdate: 'CASCADE', eager: true })
  @JoinColumn()
  createdUser: UserEntity;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  @ManyToOne((type: any) => UserEntity, { nullable: false, onDelete: 'SET NULL', onUpdate: 'CASCADE', eager: true })
  @JoinColumn()
  updatedUser: UserEntity;
}
