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
import { UserEntity } from '../../user/user.entity';
import { TicketDepartmentEntity } from '../department/department.entity';
// #endregion
// #region Imports Local
// #endregion

@Entity('ticket_group_service')
export class TicketGroupServiceEntity {
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
  @OneToOne((type: any) => TicketDepartmentEntity, { onDelete: 'CASCADE' })
  @JoinColumn()
  department: TicketDepartmentEntity;

  toResponseObject = (): TicketGroupServiceEntity => ({ ...this });
}
