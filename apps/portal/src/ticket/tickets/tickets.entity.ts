/** @format */

// #region Imports NPM
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToOne,
} from 'typeorm';
// #endregion
// #region Imports Local
import { UserEntity } from '@back/user/user.entity';
import { TicketServiceEntity } from '@back/ticket/service/service.entity';
// #endregion

@Entity('tickets')
export class TicketsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  title: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  body: string;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  @OneToOne((type: any) => UserEntity, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn()
  user: UserEntity;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  @OneToOne((type: any) => TicketServiceEntity, { onDelete: 'CASCADE' })
  @JoinColumn()
  service: TicketServiceEntity;

  toResponseObject = (): TicketsEntity => ({ ...this });
}
