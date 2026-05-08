import { pgTable, text, uuid, timestamp, integer, varchar, boolean, jsonb, real } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: text('id').primaryKey(),                              // Clerk user_xxx — text NOT uuid
  email: text('email').notNull(),
  username: text('username'),
  name: text('name'),
  plan: varchar('plan', { length: 20 }).default('free').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const jobs = pgTable('jobs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  status: varchar('status', { length: 20 }).default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const candidates = pgTable('candidates', {
  id: uuid('id').defaultRandom().primaryKey(),
  jobId: uuid('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  name: text('name'),
  email: text('email'),
  resumeUrl: text('resume_url'),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const hiringBlueprints = pgTable('hiring_blueprints', {
  id: uuid('id').defaultRandom().primaryKey(),
  jobId: uuid('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  blueprint: jsonb('blueprint').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const evaluations = pgTable('evaluations', {
  id: uuid('id').defaultRandom().primaryKey(),
  candidateId: uuid('candidate_id').notNull().references(() => candidates.id, { onDelete: 'cascade' }),
  skillsScore: real('skills_score'),
  technicalScore: real('technical_score'),
  cultureScore: real('culture_score'),
  compositeScore: real('composite_score'),
  recommendation: varchar('recommendation', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const agentRuns = pgTable('agent_runs', {
  id: uuid('id').defaultRandom().primaryKey(),
  candidateId: uuid('candidate_id').references(() => candidates.id, { onDelete: 'cascade' }),
  jobId: uuid('job_id').references(() => jobs.id, { onDelete: 'cascade' }),
  agentName: text('agent_name').notNull(),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  input: jsonb('input'),
  output: jsonb('output'),
  durationMs: integer('duration_ms'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const reports = pgTable('reports', {
  id: uuid('id').defaultRandom().primaryKey(),
  candidateId: uuid('candidate_id').notNull().references(() => candidates.id, { onDelete: 'cascade' }),
  pdfUrl: text('pdf_url'),
  emailSent: boolean('email_sent').default(false).notNull(),
  emailSentAt: timestamp('email_sent_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const overrides = pgTable('overrides', {
  id: uuid('id').defaultRandom().primaryKey(),
  candidateId: uuid('candidate_id').notNull().references(() => candidates.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  action: varchar('action', { length: 20 }).notNull(), // 'approve' | 'reject' | 'adjust'
  reason: text('reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
