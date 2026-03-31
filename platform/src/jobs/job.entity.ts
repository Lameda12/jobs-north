import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
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

  @Column({ default: 'part_time' })
  contract_time: string;

  @Column({ default: 'in-person' })
  work_type: string;

  @Column('jsonb')
  category: object;

  @Column({ nullable: true })
  redirect_url: string;

  /** Source of the listing: 'seed' | 'jobbank' | 'indeed' etc. */
  @Column({ default: 'seed' })
  source: string;

  @CreateDateColumn()
  scraped_at: Date;

  /**
   * 384-dim embedding from all-MiniLM-L6-v2.
   * HNSW index is created via enable-vector.ts after seeding.
   */
  @Column({
    type: 'vector',
    length: 384,
    nullable: true,
    transformer: {
      to: (value: number[]) => (value ? toSql(value) : null),
      from: (value: string) => (value ? fromSql(value) : null),
    },
  })
  embedding: number[] | null;
}
