/** @format */

// #region Imports NPM
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
// #endregion
// #region Imports Local
// #endregion

@Entity('news')
export class NewsEntity {
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
    nullable: true,
  })
  excerpt: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  content: string;
}
