import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { jobs, candidates, hiringBlueprints, evaluations, agentRuns, reports } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { getOrCreateUser } from '@/lib/auth'
import { PDFParse } from 'pdf-parse'
import mammoth from 'mammoth'

import { runOrchestrator } from '../agents/orchestrator'
import { runJobIntelligence, type HiringBlueprint } from '../agents/job-intelligence'
import { runCandidateExtraction } from '../agents/candidate-extraction'
import { runVerificationRisk } from '../agents/verification-risk'
import { runTechnicalValidation } from '../agents/technical-validation'
import { runBehavioralAlignment } from '../agents/behavioral-alignment'
import { runEvaluationAggregator } from '../agents/evaluation-aggregator'
import { runDecisionAgent } from '../agents/decision-agent'
import { runReportGenerator } from '../agents/report-generator'

export const maxDuration = 300

export async function POST(req: NextRequest) {
  try {
    await getOrCreateUser()

    const { jobId } = await req.json() as { jobId: string }
    if (!jobId) return NextResponse.json({ error: 'jobId required' }, { status: 400 })

    const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1)
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

    // Agent 1: Orchestrator
    const pendingCount = await db
      .select()
      .from(candidates)
      .where(and(eq(candidates.jobId, jobId), eq(candidates.status, 'pending')))
      .then(r => r.length)

    let t = Date.now()
    const orchestratorPlan = await runOrchestrator(
      { id: job.id, title: job.title, department: job.department, experienceLevel: job.experienceLevel, description: job.description },
      pendingCount,
    )
    await db.insert(agentRuns).values({
      jobId, agentName: 'orchestrator', status: 'completed',
      output: { sessionId: orchestratorPlan.sessionId, candidateCount: pendingCount },
      durationMs: Date.now() - t,
    })
    console.log('[Agent 1] orchestrator done — sessionId:', orchestratorPlan.sessionId)

    // Agent 2: Job Intelligence — run once per job, reuse if already exists
    let blueprint: HiringBlueprint
    const [existingBlueprint] = await db
      .select()
      .from(hiringBlueprints)
      .where(eq(hiringBlueprints.jobId, jobId))
      .limit(1)

    t = Date.now()
    if (existingBlueprint) {
      blueprint = existingBlueprint.blueprint as unknown as HiringBlueprint
      console.log('[Agent 2] blueprint reused for job', jobId)
    } else {
      blueprint = await runJobIntelligence({
        title: job.title,
        department: job.department,
        description: job.description,
        skills: job.skills as string[],
        locationType: job.locationType,
        jobType: job.jobType,
        experienceLevel: job.experienceLevel,
      })
      await db.insert(hiringBlueprints).values({ jobId, blueprint })
      console.log('[Agent 2] blueprint created for job', jobId)
    }
    await db.insert(agentRuns).values({
      jobId, agentName: 'job-intelligence', status: 'completed',
      output: {
        roleArchetype: blueprint.roleArchetype,
        technicalDepth: blueprint.technicalDepth,
        requiredSkillsCount: blueprint.requiredSkills?.length ?? 0,
      },
      durationMs: Date.now() - t,
    })

    // Fetch all pending candidates
    const pendingCandidates = await db
      .select()
      .from(candidates)
      .where(and(eq(candidates.jobId, jobId), eq(candidates.status, 'pending')))

    if (pendingCandidates.length === 0) {
      return NextResponse.json({ success: true, candidatesProcessed: 0 })
    }

    let processed = 0

    for (const candidate of pendingCandidates) {
      const start = Date.now()
      try {
        // Extract resume text from base64
        const buf = Buffer.from(candidate.resumeContent!, 'base64')
        let resumeText = ''
        if (candidate.resumeName?.toLowerCase().endsWith('.pdf')) {
          const parser = new PDFParse({ data: buf })
          const pdfResult = await parser.getText()
          resumeText = pdfResult.text
        } else {
          const result = await mammoth.extractRawText({ buffer: buf })
          resumeText = result.value
        }

        // Agent 3: Candidate Extraction
        t = Date.now()
        const isPdf = candidate.resumeName?.toLowerCase().endsWith('.pdf')
        const profile = await runCandidateExtraction(resumeText, isPdf ? buf : undefined)
        await db.insert(agentRuns).values({
          candidateId: candidate.id, jobId, agentName: 'candidate-extraction', status: 'completed',
          output: { name: profile.name, skillsCount: profile.skills.length, experienceYears: profile.experienceYears },
          durationMs: Date.now() - t,
        })
        console.log('[Agent 3] extraction done for', candidate.id)

        // Agent 4: Verification & Risk
        t = Date.now()
        const risk = await runVerificationRisk(profile, blueprint, resumeText)
        await db.insert(agentRuns).values({
          candidateId: candidate.id, jobId, agentName: 'verification-risk', status: 'completed',
          output: { riskLevel: risk.riskLevel, flagCount: risk.flags.length },
          durationMs: Date.now() - t,
        })
        console.log('[Agent 4] verification done for', candidate.id)

        // Agent 5: Technical Validation
        t = Date.now()
        const technical = await runTechnicalValidation(profile, blueprint)
        await db.insert(agentRuns).values({
          candidateId: candidate.id, jobId, agentName: 'technical-validation', status: 'completed',
          output: { score: technical.score, githubActivityLevel: technical.githubActivityLevel },
          durationMs: Date.now() - t,
        })
        console.log('[Agent 5] technical validation done for', candidate.id)

        // Agent 6: Behavioral Alignment
        t = Date.now()
        const behavioral = await runBehavioralAlignment(profile, blueprint, resumeText)
        await db.insert(agentRuns).values({
          candidateId: candidate.id, jobId, agentName: 'behavioral-alignment', status: 'completed',
          output: { score: behavioral.score },
          durationMs: Date.now() - t,
        })
        console.log('[Agent 6] behavioral alignment done for', candidate.id)

        // Agent 7: Evaluation Aggregator
        t = Date.now()
        const aggregated = await runEvaluationAggregator(profile, blueprint, technical.score, behavioral.score, blueprint.priorityWeights ?? orchestratorPlan.recommendedWeights)
        await db.insert(agentRuns).values({
          candidateId: candidate.id, jobId, agentName: 'evaluation-aggregator', status: 'completed',
          output: { compositeScore: aggregated.compositeScore, recommendation: aggregated.recommendation },
          durationMs: Date.now() - t,
        })
        console.log('[Agent 7] aggregation done for', candidate.id, '— score:', aggregated.compositeScore)

        // Agent 8: Decision Agent
        t = Date.now()
        const decision = await runDecisionAgent(profile, blueprint, aggregated, risk)
        await db.insert(agentRuns).values({
          candidateId: candidate.id, jobId, agentName: 'decision-agent', status: 'completed',
          output: { recommendation: decision.recommendation, decisionConfidence: decision.decisionConfidence },
          durationMs: Date.now() - t,
        })
        console.log('[Agent 8] decision done for', candidate.id, '—', decision.recommendation)

        // Agent 9: Report Generator
        t = Date.now()
        const report = await runReportGenerator(profile, blueprint, aggregated, decision, risk, technical, job.title)
        await db.insert(agentRuns).values({
          candidateId: candidate.id, jobId, agentName: 'report-generator', status: 'completed',
          output: { candidateName: report.candidateName },
          durationMs: Date.now() - t,
        })
        console.log('[Agent 9] report generated for', candidate.id)

        // Save evaluation
        await db.insert(evaluations).values({
          candidateId: candidate.id,
          skillsScore: aggregated.breakdown.skills,
          technicalScore: aggregated.breakdown.technical,
          cultureScore: aggregated.breakdown.culture,
          compositeScore: aggregated.compositeScore,
          recommendation: aggregated.recommendation,
        })

        // Update candidate
        await db
          .update(candidates)
          .set({ name: profile.name, email: profile.email, status: 'screened' })
          .where(eq(candidates.id, candidate.id))

        // Save report
        await db.insert(reports).values({ candidateId: candidate.id, emailSent: false })

        // Full audit log
        await db.insert(agentRuns).values({
          candidateId: candidate.id, jobId,
          agentName: 'full-pipeline', status: 'completed',
          input: { resumeName: candidate.resumeName },
          output: { profile, risk, technical, behavioral, aggregated, decision, report },
          durationMs: Date.now() - start,
        })

        processed++
      } catch (err) {
        console.error('[pipeline] candidate %s failed:', candidate.id, err)
        await db.insert(agentRuns).values({
          candidateId: candidate.id, jobId,
          agentName: 'full-pipeline', status: 'failed',
          input: { resumeName: candidate.resumeName },
          output: { error: err instanceof Error ? err.message : String(err) },
          durationMs: Date.now() - start,
        })
      }
    }

    return NextResponse.json({ success: true, candidatesProcessed: processed })
  } catch (err) {
    console.error('[run-pipeline]', err)
    return NextResponse.json({ error: 'Pipeline failed' }, { status: 500 })
  }
}
