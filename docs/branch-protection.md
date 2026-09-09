# Branch protection & release flow

Target workflow once this doc's prerequisite is met:

```
feature/* → PR + CI → main → PR (review + source-branch guard only) → prod → production deploy
```

No one — including admins — pushes directly to `main` or `prod`; every change lands through a pull request. CI (`verify`) only runs once, on PRs targeting `main` — a PR from `main` into `prod` re-runs a check that already passed, so `prod` only requires review and the `validate-prod-source` guard, not the full `verify` job again. Direct pushes to any other branch never trigger CI at all.

## Current blocker: GitHub plan

`tan-tao-university` is on the GitHub **Free** org plan and `ttu-platform` is a **private** repo. GitHub only offers branch protection rules / rulesets on private repos for organizations on the **Team** or **Enterprise** plan — confirmed against the live repo:

```
$ gh api repos/tan-tao-university/ttu-platform/rulesets
{"message":"Upgrade to GitHub Pro or make this repository public to enable this feature.", "status":"403"}
```

Rulesets cannot be created until the org either upgrades to GitHub Team (or above) or the repo is made public. Nothing below can be enforced until then; this doc records the exact steps so whoever has org billing access can apply them the moment the plan changes.

## What's already in place

- `.github/workflows/branch-policy.yml` — `validate-prod-source` fails any PR into `prod` whose source branch isn't `main`. This runs today regardless of plan; it just isn't yet a required check because required checks need a ruleset.
- `.github/workflows/ci.yml` — `pull_request` is scoped to `branches: [main]`, so `verify` only runs for PRs targeting `main`; PRs into `prod` and pushes to any other branch skip it.
- `prod` branch exists (created off `main`, no production CD wired to it yet — see root [README.md](../README.md) Status).
- `.github/CODEOWNERS`, `.github/PULL_REQUEST_TEMPLATE.md`, `.github/ISSUE_TEMPLATE/*`, `.github/dependabot.yml`, and the `auto-assign*` workflows — repo hygiene modeled on [`sit-ttu/sit-website`](https://github.com/sit-ttu/sit-website/tree/main/.github). None of these need the plan upgrade; CODEOWNERS review enforcement (`Require review from Code Owners`) does, once it's added as a `pull_request` rule parameter below.

## Rulesets to create once the plan supports it

Two rulesets, no bypass actors (so admins/owners are not exempt). Requires repo admin access and a plan that supports private-repo rulesets.

```bash
# Protect main
gh api repos/tan-tao-university/ttu-platform/rulesets -X POST --input - <<'JSON'
{
  "name": "Protect main",
  "target": "branch",
  "enforcement": "active",
  "bypass_actors": [],
  "conditions": { "ref_name": { "include": ["refs/heads/main"], "exclude": [] } },
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 1,
        "dismiss_stale_reviews_on_push": true,
        "require_code_owner_review": true,
        "require_last_push_approval": true,
        "required_review_thread_resolution": true
      }
    },
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": true,
        "required_status_checks": [{ "context": "verify" }]
      }
    }
  ]
}
JSON

# Protect prod
gh api repos/tan-tao-university/ttu-platform/rulesets -X POST --input - <<'JSON'
{
  "name": "Protect prod",
  "target": "branch",
  "enforcement": "active",
  "bypass_actors": [],
  "conditions": { "ref_name": { "include": ["refs/heads/prod"], "exclude": [] } },
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 1,
        "dismiss_stale_reviews_on_push": true,
        "require_code_owner_review": true,
        "require_last_push_approval": true,
        "required_review_thread_resolution": true
      }
    },
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": true,
        "required_status_checks": [{ "context": "validate-prod-source" }]
      }
    }
  ]
}
JSON
```

`verify` (required on `main` only — it never runs on `prod` PRs, see above) is the CI job name in [`ci.yml`](../.github/workflows/ci.yml); `validate-prod-source` is the job in `branch-policy.yml` above. If either workflow's job name changes, update the `context` values here to match — GitHub matches required checks by the job/check name reported on the commit, not by workflow file name.

## Why rulesets, not legacy branch protection

Rulesets support an explicit, empty `bypass_actors` list, which is what makes "not even admins" enforceable — legacy branch protection's "Include administrators" toggle is weaker and scoped per-branch rule instead of per-actor. Both features are gated by the same plan requirement on private repos.
