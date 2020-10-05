/** @format */

//#region Imports NPM
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, JoinColumn, ManyToOne } from 'typeorm';
//#endregion
//#region Imports Local
import { UserEntity } from '@back/user/user.entity';
//#endregion

@Entity('news')
export class NewsEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string | null;

  @CreateDateColumn()
  createdAt?: Date | null;

  @UpdateDateColumn()
  updatedAt?: Date | null;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  title!: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  excerpt!: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  content!: string | null;

  @ManyToOne(() => UserEntity)
  @JoinColumn()
  author!: UserEntity;
}
