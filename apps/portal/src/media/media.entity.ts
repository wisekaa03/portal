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

@Entity('media')
export class MediaEntity {
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

  @Column({
    type: 'varchar',
    nullable: false,
  })
  directory: string;

  // TODO: это ссылка на файл, который будет лежать где-то... продумать.
  @Column({
    type: 'varchar',
    nullable: false,
  })
  filename: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  mimetype: string;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  @ManyToOne((type: any) => UserEntity)
  @JoinColumn()
  user: UserEntity;
}
