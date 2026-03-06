---
title: "Your Family Shouldn't Have to Guess: Building Soul Legacy"
description: "A zero-knowledge digital estate vault with AI-powered document chat. Local-first encryption, blockchain anchoring, and a dead man's switch that actually works."
date: "2026-03-05"
tags: ["estate-planning", "encryption", "ai", "open-source", "python"]
---

When someone dies, their family spends months hunting for documents.

Bank accounts scattered across institutions. Insurance policies in a filing cabinet somewhere. A will that might be with the attorney, or maybe in a safety deposit box, or possibly in that folder labeled "IMPORTANT" that hasn't been opened since 2019.

**Soul Legacy fixes that.**

## The Problem Nobody Wants to Talk About

Estate planning isn't just about having a will. It's about making sure the people you leave behind can actually *find* everything:

- Where are your accounts?
- What insurance policies exist?
- Who's the executor? The attorney? The accountant?
- What are your wishes for... everything?

Most families discover the answers to these questions through months of painful detective work — calling institutions, searching through papers, guessing at passwords. Some things are never found at all.

## What Soul Legacy Does

Soul Legacy is a local-first, encrypted digital estate vault. Store everything that matters — assets, insurance, legal documents, debts, contacts, beneficiaries, digital accounts, final wishes — in one place your family can actually access when they need to.

```bash
pip install soul-legacy
soul-legacy init
```

That's it. A guided wizard walks you through setup, creates an encrypted vault on your device, and you're ready to start documenting your estate.

### Eight Structured Sections

| Section | What Goes Here |
|---------|---------------|
| **Assets** | Bank accounts, brokerage, real estate, vehicles, crypto |
| **Insurance** | Life, health, property, auto — policies and beneficiaries |
| **Legal** | Will, trust, power of attorney, healthcare directive |
| **Debts** | Mortgage, loans, credit cards — what your estate owes |
| **Contacts** | Attorney, accountant, executor, financial advisor |
| **Beneficiaries** | Who gets what, relationships, percentages |
| **Digital** | Email, social media, crypto wallets, subscriptions |
| **Wishes** | Funeral preferences, medical directives, personal messages |

### AI-Powered Document Chat

Upload your actual documents — wills, insurance policies, bank statements — and ask questions in plain English:

```
You: What does my will say about the lake house?

Advisor: Per will.pdf (page 3), the lake house at 142 Lakeview Dr 
is bequeathed to Jane Doe, contingent on settling the mortgage 
balance first.
```

Soul Legacy uses RAG (retrieval-augmented generation) to search your documents and answer with citations. Your executor can ask "Generate a checklist of everything I need to do" and get an actionable plan grounded in your actual paperwork.

## The Technical Deep Dive

### Zero-Knowledge Encryption

Your data is encrypted with AES-128-CBC + HMAC-SHA256 before it ever leaves your device. Key derivation uses PBKDF2-SHA256 with **600,000 iterations** (OWASP 2023 recommendation).

```python
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

ITERATIONS = 600_000

def derive_key(passphrase: str, salt: bytes) -> bytes:
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=ITERATIONS,
        backend=default_backend()
    )
    return base64.urlsafe_b64encode(kdf.derive(passphrase.encode()))
```

**If you lose your passphrase, your data is unrecoverable.** This is a feature, not a bug. We can't read your data — not because we choose not to, but because it's mathematically impossible without your key.

### Document Ingestion Pipeline

When you upload a document, Soul Legacy:

1. **Extracts text** — PDFplumber for PDFs, Tesseract OCR for scanned images
2. **Auto-detects section** — keyword analysis determines if it's legal, insurance, assets, etc.
3. **Chunks the text** — ~500 tokens with 50-token overlap for retrieval
4. **Embeds locally** — FastEmbed (ONNX, no GPU required) or cloud embeddings
5. **Indexes in vector DB** — SQLite-vec locally, Qdrant for cloud
6. **Encrypts and stores** — original file encrypted in vault

```python
def auto_detect_section(text: str) -> str:
    """Guess which vault section a document belongs to"""
    SECTION_KEYWORDS = {
        "legal": ["will", "trust", "attorney", "power", "directive"],
        "insurance": ["policy", "premium", "coverage", "beneficiary"],
        "assets": ["account", "balance", "investment", "brokerage"],
        # ...
    }
    scores = {s: sum(1 for kw in kws if kw in text.lower()) 
              for s, kws in SECTION_KEYWORDS.items()}
    return max(scores, key=scores.get)
```

### Tamper-Evident Anchoring (Two Modes)

Soul Legacy proves your documents haven't been tampered with. You get two options:

#### Option 1: Local Anchoring (Default)

Out of the box, every vault action is cryptographically signed and logged locally:

```python
# LocalAnchor — no blockchain required
class LocalAnchor:
    def checkin(self, vault):
        vh = compute_vault_hash(vault)        # SHA-256 of all records
        event = {
            "type": "CheckIn",
            "timestamp": time.time(),
            "vault_hash": vh
        }
        event["signature"] = hmac.new(        # HMAC-SHA256 signature
            self._secret, json.dumps(event), hashlib.sha256
        ).hexdigest()
        self.state["log"].append(event)
```

This gives you:
- Tamper detection (signatures break if anything changes)
- Full audit trail of every check-in
- Works offline, no wallet, no gas fees
- Can export history to blockchain later

**Verify integrity anytime:**
```bash
soul-legacy verify   # checks all signatures, detects tampering
```

#### Option 2: Polygon Blockchain (Optional)

For on-chain immutability, deploy the included Solidity contract:

```solidity
// VaultAnchor.sol — deploy to Polygon Amoy (testnet) or mainnet
contract VaultAnchor {
    struct Vault {
        bytes32 vaultHash;      // SHA256 of vault contents
        uint256 lastCheckin;    // unix timestamp
        uint256 gracePeriod;    // dead man's switch timer
        bool released;
    }
    
    function checkin(bytes32 newVaultHash) external {
        vaults[msg.sender].lastCheckin = block.timestamp;
        vaults[msg.sender].vaultHash = newVaultHash;
        emit CheckIn(msg.sender, block.timestamp, newVaultHash);
    }
}
```

**Setup:**
1. Deploy `VaultAnchor.sol` to Polygon (Remix, Hardhat, or Foundry)
2. Configure `~/.openclaw/api_keys.json`:
   ```json
   {
     "polygon": {
       "network": "amoy",
       "rpc_url": "https://rpc-amoy.polygon.technology",
       "private_key": "your-wallet-private-key",
       "contract_addr": "0xYourDeployedContract"
     }
   }
   ```
3. Now every check-in anchors on-chain automatically

**Cost:** ~$0.001 per transaction on mainnet. Free on Amoy testnet.

**Why bother?** If someone contests the authenticity of your will or claims documents were altered, the blockchain timestamp proves they existed in that exact state at that exact time. Courts are increasingly accepting blockchain evidence.

### The Dead Man's Switch

This is where it gets interesting.

Configure a grace period (default: 30 days). Soul Legacy expects you to check in periodically — click a button, respond to an email link, or just use the app. If you don't check in:

- **Day 27**: Warning email sent to you
- **Day 30**: Final warning + SMS
- **Day 37**: Release triggered — your designated inheritors receive scoped access tokens

```python
class DeadMansSwitch:
    def tick(self):
        days_since = (now - last_checkin).days
        
        if days_since >= (grace - 3) and not warning_sent:
            self._send_warning()
            
        if days_since >= (grace + 7):
            self._release()  # Generate tokens, email inheritors
```

**Scoped access**: Your attorney only sees legal documents. Your accountant sees assets and debts. Your family gets what you designate. Nobody sees everything unless you want them to.

The release is also recorded on-chain (if configured), creating an immutable timestamp of when access was granted.

## Three Ways to Use It

### 1. Local Only (Free Forever)

```bash
pip install soul-legacy
soul-legacy init
soul-legacy serve  # Web UI at localhost:8080
```

Everything stays on your device. No account, no cloud, no subscription.

### 2. Local + Web UI

```bash
soul-legacy serve
```

Opens a clean web interface at `localhost:8080`. Same local vault, friendlier interface than CLI.

**Try the UI**: [legacy.thinkcreateai.com](https://legacy.thinkcreateai.com)

### 3. Managed Cloud

For those who want hosted backup, multi-device sync, and managed dead man's switch:

**Cloud app**: [app.legacy.thinkcreateai.com](https://app.legacy.thinkcreateai.com)

Your vault is still encrypted with your passphrase — we store ciphertext only. Plans start at $9/month.

## Part of the Soul Ecosystem

Soul Legacy is the "what you have" layer of the soul.py ecosystem:

| Project | Purpose |
|---------|---------|
| [soul.py](/blog/soul-py-persistent-memory-llm-agents) | Who you are — identity, memory, values |
| **soul-legacy** | What you have — assets, wishes, legacy |
| [soul-schema](/blog/soul-schema-auto-document-data-warehouse) | Data layer — auto-document any database |
| [SoulMate](https://menonpg.github.io/soulmate/) | Enterprise — HIPAA-compliant, at scale |

## Get Started

```bash
pip install soul-legacy
soul-legacy init
```

**Links:**
- **PyPI**: [pypi.org/project/soul-legacy](https://pypi.org/project/soul-legacy/)
- **Demo**: [legacy.thinkcreateai.com](https://legacy.thinkcreateai.com)
- **Cloud**: [app.legacy.thinkcreateai.com](https://app.legacy.thinkcreateai.com)
- **Docs**: [legacy.thinkcreateai.com/#docs](https://legacy.thinkcreateai.com/#docs)

---

Your family shouldn't have to guess. Document it now, while you can.

*Soul Legacy is source-available under BSL 1.1. Free for personal use. Converts to MIT on 2030-03-05.*
