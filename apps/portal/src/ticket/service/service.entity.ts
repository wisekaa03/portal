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
import { TicketGroupServiceEntity } from '@back/ticket/group-service/group-service.entity';
// #endregion

@Entity('ticket_service')
export class TicketServiceEntity {
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
  name: string;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  @OneToOne((type: any) => UserEntity, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn()
  user: UserEntity;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  @OneToOne((type: any) => TicketGroupServiceEntity, { onDelete: 'CASCADE' })
  @JoinColumn()
  groupService: TicketGroupServiceEntity;

  toResponseObject = (): TicketServiceEntity => ({ ...this });
}
