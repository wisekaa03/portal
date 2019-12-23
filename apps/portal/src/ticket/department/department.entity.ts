/** @format */

// #region Imports NPM
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
// #endregion
// #region Imports Local
// #endregion

@Entity('ticketDepartment')
export class TicketDepartmentEntity {
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

  toResponseObject = (): TicketDepartmentEntity => ({ ...this });
}
