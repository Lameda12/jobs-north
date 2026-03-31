import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { toSql, fromSql } from 'pgvector';

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  original_id: string;

  @Column()
  title: string;

  @Column('jsonb')
  company: object;

  @Column('jsonb')
  location: object;

  @Column('text')
  description: string;

  @Column({ type: 'integer', nullable: true })
  salary_min: number;

  @Column({ type: 'integer', nullable: true })
  salary_max: number;

  @Column()
  contract_time: string;

  @Column()
  work_type: string;

  @Column('jsonb')
  category: object;

  @Column()
  redirect_url: string;

  @Index({ fulltext: true })
  @Column({
    type: 'vector',
    length: 384, // Length of the all-MiniLM-L6-v2 embedding
    nullable: true,
    transformer: {
      to: (value: number[]) => (value ? toSql(value) : null),
      from: (value: string) => (value ? fromSql(value) : null),
    },
  })
  embedding: number[];
}
