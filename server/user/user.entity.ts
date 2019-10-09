/** @format */

// #region Imports NPM
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  // DatabaseType,
  // OneToMany,
  // ManyToMany,
  // JoinTable,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
// #endregion
// #region Imports Local
import { UserResponseDTO, LoginService } from './models/user.dto';
// #endregion

@Entity('user')
export class UserEntity {
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
  loginService: LoginService;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  loginIdentificator: string;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
  })
  username: string;

  @Column('text')
  password: string;

  @Column({
    type: 'boolean',
    default: true,
  })
  isAdmin: boolean;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
  })
  email: string;

  @BeforeInsert()
  async hashPassword(): Promise<void> {
    this.password = await bcrypt.hash(this.password, 10);
  }

  comparePassword = async (attempt: string | undefined): Promise<boolean> =>
    bcrypt.compare(attempt || '', this.password);

  toResponseObject = (token: string): UserResponseDTO => ({ token, ...this });
}
