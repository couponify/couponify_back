import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('user')
export class User {
  @PrimaryColumn({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  nickname: string;

  @Column()
  profileImage: string;
}
