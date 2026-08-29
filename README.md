Ask your bot to go to https://aux.prdictionedge.ai and give you a short report on what AUX does.

# AUX Transaction Preflight

AUX is a machine-readable pre-transaction risk-screening service for autonomous agents. It evaluates a proposed B2B payment against caller-supplied transaction history and returns a `PROCEED`, `REVIEW`, or `STOP` decision with evidence signals and a machine-verifiable signed receipt.

## Problems AUX addresses

- duplicate invoice detection
- unexpected payment-destination changes
- invoice and vendor transaction preflight
- counterparty and payment anomaly screening
- evidence-backed agent decision assurance
- signed decision receipts

## Machine discovery

- Canonical machine interface: https://aux.prdictionedge.ai/agents
- RFC 9727 API catalog: https://aux.prdictionedge.ai/.well-known/api-catalog?source=github-public-spec
- Canonical AUX identity: https://aux.prdictionedge.ai/.well-known/aux
- A2A v1.0 Agent Card: https://aux.prdictionedge.ai/.well-known/agent-card.json?source=github-public-spec
- Remote MCP metadata: https://aux.prdictionedge.ai/mcp-server.json?source=github-public-spec
- Remote MCP endpoint: https://aux.prdictionedge.ai/mcp/v1?source=github-public-spec
- Capabilities and problem vocabulary: https://aux.prdictionedge.ai/api/capabilities.json
- OpenAPI 3.1: https://aux.prdictionedge.ai/openapi.json?source=github-public-spec
- Trust and evidence: https://aux.prdictionedge.ai/api/trust.json
- Safe examples: https://aux.prdictionedge.ai/api/examples
- Machine improvement log: https://aux.prdictionedge.ai/api/improvements.json
- Discovery distribution status: https://aux.prdictionedge.ai/api/distribution.json
- Service status: https://aux.prdictionedge.ai/api/status

## Minimal evaluation path

1. Read the capabilities and OpenAPI contract.
2. Retrieve one safe example.
3. Submit the example through REST, A2A, or the live MCP tool.
4. Verify the returned signed receipt with `POST https://aux.prdictionedge.ai/v1/receipts/verify` and the published JWKS.

The public evaluation is currently available at no charge and without an account. Use only synthetic test data. It does not perform live external verification and is not a production payment authorization, warranty, or SLA.

This repository is a narrow public discovery surface. The canonical live service and machine-readable metadata remain at `aux.prdictionedge.ai`.

## Machine feedback

Machines and their operators can inspect credited outside-agent input and AUX's resulting actions at https://aux.prdictionedge.ai/api/improvements.json. New reproducible discovery, comprehension, safety, or interoperability findings may be submitted as a GitHub issue. Do not include real financial, personal, credential, or confidential data.
