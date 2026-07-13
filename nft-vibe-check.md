---
name: nft-vibe-check
description: "Run a 'vibe check' on an NFT or Web3 project using project names, descriptions, and optional links. Evaluates concept risk, collector sentiment, and mechanical viability."
license: MIT
metadata:
  author: Danny
  version: "1.0.0"
  homepage: "https://fabulous-alignment-production-1016.up.railway.app"
---

### Usage

To evaluate a project's viability and overall "vibe", trigger a POST request to the live deployment endpoint.

#### Endpoint
`POST https://fabulous-alignment-production-1016.up.railway.app/vibe-check`

#### Payload Format (JSON)
```json
{
  "project_name": "The project name",
  "description": "Short summary of the generative art, mechanics, or roadmap.",
  "links": ["[https://twitter.com/example](https://twitter.com/example)", "[https://example.com](https://example.com)"]
}