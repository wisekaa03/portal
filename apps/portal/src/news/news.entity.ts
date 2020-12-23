/** @format */

//#region Imports NPM
import { ObjectType, Field, ID, HideField } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, JoinColumn, ManyToOne } from 'typeorm';
//#endregion
//#region Imports Local
import { User } from '@back/user/user.entity';
//#endregion

@ObjectType()
@Entity('news')
export class News {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Field(() => Date, { nullable: true })
  @CreateDateColumn()
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  @UpdateDateColumn()
  updatedAt?: Date;

  @Field(() => String)
  @Column({
    type: 'varchar',
    nullable: false,
  })
  title!: string;

  @Field(() => String, { nullable: true })
  @Column({
    type: 'varchar',
    nullable: true,
  })
  excerpt?: string;

  @Field(() => String, { nullable: true })
  @Column({
    type: 'text',
    nullable: true,
  })
  content?: string;

  @Field(() => User)
  @ManyToOne(() => User)
  @JoinColumn()
  author!: User;
}
