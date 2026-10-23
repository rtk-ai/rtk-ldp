import type { APIRoute } from 'astro'
import data from '../../data/pipelines.json'
import { oneLiner } from '../../components/pipelines/summary'
import { headline, aim, requirements } from '../../components/pipelines/impact'

export const GET: APIRoute = () => {
  const body = {
    generated: data.generated,
    rtk_min: data.rtkMin,
    pipelines: (data.pipelines as any[]).map((p) => {
      const h = headline(p)
      return {
        id: p.id,
        name: p.name,
        summary: oneLiner(p),
        aim: aim(p).key,
        result: { kind: h.kind, evidence: h.evidence, value: h.value, unit: h.unit, quality: h.quality.text },
        benchmark: p.benchmark
          ? { suite: p.benchmark.suite, model: p.benchmark.model, trials_per_arm: p.benchmark.trialsPerArm, cost: p.benchmark.cost, quality: p.benchmark.quality }
          : null,
        self_reported: p.selfReported ? { headline: p.selfReported.headline, rtk: p.selfReported.rtkVersion, on: p.selfReported.measuredOn } : null,
        requires: requirements(p).map((r) => ({ kind: r.kind, name: r.name, env: r.env })),
        sha: p.sha,
        install: p.install,
        tier: p.tier,
        stars: p.stars,
        approvedAt: p.approvedAt,
        url: `https://www.rtk-ai.app/pipelines/${p.owner}/${p.repo}/`,
      }
    }),
    revoked: data.revoked,
  }
  return new Response(JSON.stringify(body, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}
