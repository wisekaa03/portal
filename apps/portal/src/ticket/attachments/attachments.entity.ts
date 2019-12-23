/** @format */

// #region Imports NPM
import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, JoinColumn, OneToOne } from 'typeorm';
// #endregion
// #region Imports Local
import { UserEntity } from '../../user/user.entity';
import { TicketsEntity } from '../tickets/tickets.entity';
import { TicketCommentsEntity } from '../comments/comments.entity';
// #endregion

@Entity('ticket_attachments')
export class TicketAttachmentsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // @Column({
  //   type: 'varchar',
  //   nullable: true,
  // })
  // file: string;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  @OneToOne((type: any) => UserEntity, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn()
  user: UserEntity;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  @OneToOne((type: any) => TicketsEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn()
  ticket: TicketsEntity;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  @OneToOne((type: any) => TicketCommentsEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn()
  comments: TicketCommentsEntity;

  toResponseObject = (): TicketAttachmentsEntity => ({ ...this });
}
